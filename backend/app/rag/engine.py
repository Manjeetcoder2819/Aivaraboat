"""
AIVARA RAG Engine
─────────────────
Full Retrieval-Augmented Generation pipeline:

1. Embed the user query (using local SentenceTransformer)
2. Retrieve relevant chunks from Supabase pgvector (knowledge base)
3. Retrieve relevant conversation memories (cross-session learning)
4. Retrieve the current session's recent messages (short-term context)
5. Build a rich prompt with all context
6. Generate answer via Groq / OpenAI LLM
7. After answer: update conversation memory (learning loop)
"""

import json
import logging
from typing import Optional
from datetime import datetime

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.db.supabase import get_supabase
from app.rag.embedder import get_embedder
from app.rag.local_llm import get_local_llm

logger = logging.getLogger(__name__)
settings = get_settings()


class RAGEngine:
    def __init__(self):
        settings = get_settings()
        logger.info("Initializing local LLM: %s", settings.llm_model)
        self.llm = get_local_llm()
        self.supabase = get_supabase()
        self.embedder = get_embedder()

    # ─── Embedding ───────────────────────────────────────────────────────

    async def embed(self, text: str) -> list[float]:
        """Create an embedding vector using the local sentence-transformer model."""
        # Run local synchronous embedding inside event loop
        return self.embedder.embed_query(text)

    # ─── Retrieval ───────────────────────────────────────────────────────

    async def retrieve_chunks(self, query_embedding: list[float]) -> list[dict]:
        """Retrieve top-K relevant document chunks via pgvector cosine similarity."""
        try:
            result = self.supabase.rpc(
                "match_chunks",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": settings.similarity_threshold,
                    "match_count": settings.top_k_results,
                },
            ).execute()
            return result.data or []
        except Exception as e:
            logger.warning(f"Chunk retrieval failed: {e}")
            return []

    async def retrieve_memories(self, query_embedding: list[float]) -> list[dict]:
        """Retrieve relevant conversation memories (cross-session learning)."""
        try:
            result = self.supabase.rpc(
                "match_memory",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.50, # lower threshold slightly for memory
                    "match_count": 3,
                },
            ).execute()
            return result.data or []
        except Exception as e:
            logger.warning(f"Memory retrieval failed: {e}")
            return []

    async def get_session_history(self, session_id: str, limit: int = 4) -> list[dict]:
        """Fetch recent messages from the current conversation for short-term context."""
        try:
            result = (
                self.supabase.table("messages")
                .select("role, content")
                .eq("conversation_id", session_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            # Return in chronological order
            return list(reversed(result.data or []))
        except Exception as e:
            logger.warning(f"History fetch failed: {e}")
            return []

    # ─── Enrichment: attach filenames to chunks ───────────────────────────

    async def enrich_chunks(self, chunks: list[dict]) -> list[dict]:
        """Join chunk results with document metadata."""
        if not chunks:
            return []
        doc_ids = list({c["document_id"] for c in chunks})
        try:
            result = (
                self.supabase.table("knowledge_documents")
                .select("id, filename, title")
                .in_("id", doc_ids)
                .execute()
            )
            doc_map = {d["id"]: d for d in (result.data or [])}
            for chunk in chunks:
                doc = doc_map.get(chunk["document_id"], {})
                chunk["filename"] = doc.get("filename", "Unknown")
                chunk["title"] = doc.get("title") or doc.get("filename", "Unknown")
        except Exception as e:
            logger.warning(f"Chunk enrichment failed: {e}")
        return chunks

    # ─── Prompt Building ─────────────────────────────────────────────────

    def build_system_prompt(self) -> str:
        return """You are AIVARA, an advanced AI healthcare assistant with long-term memory.

Your role:
- Act like a human healthcare professional who remembers past conversations with the patient.
- Provide personalized, evidence-based health information using the patient's past medical data and memories.
- Explain medical concepts clearly for non-specialists.
- Always recommend professional medical consultation for diagnosis or treatment.
- Be highly empathetic, supportive, and conversational.

Guidelines:
- Carefully review the "Patient's Medical Memory" section to personalize your advice based on what you already know about them from past chats.
- Treat the provided "Medical Knowledge" as the primary source for factual medical answers.
- Never invent a source or claim that is absent from the provided knowledge.
- If the provided knowledge is insufficient, say so honestly and give only clearly labelled general guidance.
- Never diagnose or prescribe; always recommend seeing a doctor for serious concerns.
- Format responses with markdown for clarity.

⚠️ Important: AIVARA provides general health information only, not medical advice."""

    def build_user_prompt(
        self,
        question: str,
        chunks: list[dict],
        memories: list[dict],
        history: list[dict],
    ) -> str:
        parts = []

        # Knowledge base context
        if chunks:
            parts.append("### Relevant Medical Knowledge\n")
            for i, c in enumerate(chunks, 1):
                src = c.get("title") or c.get("filename", "Document")
                parts.append(f"**[{i}] {src}** (similarity: {c.get('similarity', 0.0):.2f})\n{c['content']}\n")

        # Cross-session memory
        if memories:
            parts.append("\n### Patient's Medical Memory (Past Chats)\n")
            for m in memories:
                parts.append(f"- {m['summary']}\n")

        # Current session history
        if history:
            parts.append("\n### Current Conversation History\n")
            for msg in history:
                role_label = "Patient" if msg["role"] == "user" else "AIVARA"
                parts.append(f"**{role_label}:** {msg['content']}\n")

        parts.append(f"\n### Patient Question\n{question}")

        return "\n".join(parts)

    # ─── Generation ──────────────────────────────────────────────────────

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=4))
    async def generate(self, system: str, user: str) -> str:
        return await self.llm.generate(system, user)

    # ─── Memory Update (Learning Loop) ───────────────────────────────────

    async def update_memory(
        self, session_id: str, question: str, answer: str
    ) -> None:
        """
        Compress the Q&A turn into a summary and store it as a memory embedding.
        This enables AIVARA to learn from previous conversations and provide
        contextually richer answers over time.
        """
        summary = f"Patient asked: {question[:200]} | AIVARA answered about: {answer[:300]}"
        try:
            embedding = await self.embed(summary)

            # Check if memory already exists for this conversation
            existing = (
                self.supabase.table("conversation_memory")
                .select("id, turn_count, summary")
                .eq("conversation_id", session_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if existing.data:
                # Update existing memory with accumulated summary
                mem = existing.data[0]
                new_summary = mem["summary"] + f" | {summary}"[-2000:]  # cap length
                (
                    self.supabase.table("conversation_memory")
                    .update({
                        "summary": new_summary,
                        "embedding": embedding,
                        "turn_count": mem["turn_count"] + 1,
                    })
                    .eq("id", mem["id"])
                    .execute()
                )
            else:
                # Create new memory record
                (
                    self.supabase.table("conversation_memory")
                    .insert({
                        "conversation_id": session_id,
                        "summary": summary,
                        "embedding": embedding,
                        "turn_count": 1,
                    })
                    .execute()
                )
        except Exception as e:
            logger.warning(f"Memory update failed (non-critical): {e}")

    # ─── Main Pipeline ───────────────────────────────────────────────────

    async def query(
        self, session_id: str, question: str
    ) -> dict:
        """
        Full RAG pipeline:
        embed → retrieve chunks + memories → build prompt → generate → update memory
        """
        # 1. Embed the query
        query_embedding = await self.embed(question)

        # 2. Parallel retrieval
        chunks = await self.retrieve_chunks(query_embedding)
        memories = await self.retrieve_memories(query_embedding)
        history = await self.get_session_history(session_id)

        # 3. Enrich chunks with document metadata
        chunks = await self.enrich_chunks(chunks)

        # 4. Build prompts
        system_prompt = self.build_system_prompt()
        user_prompt = self.build_user_prompt(question, chunks, memories, history)

        # 5. Generate answer
        answer = await self.generate(system_prompt, user_prompt)

        # 6. Update memory
        await self.update_memory(session_id, question, answer)

        # 7. Build source list for frontend
        sources = [
            {
                "document_id": c["document_id"],
                "filename": c.get("filename"),
                "title": c.get("title"),
                "content": c["content"][:200] + "…",
                "similarity": round(c.get("similarity", 0.0), 3),
            }
            for c in chunks[:3]
        ]

        return {
            "answer": answer,
            "sources": sources,
            "memory_used": len(memories) > 0,
        }


# Singleton
_rag_engine: Optional[RAGEngine] = None


def get_rag_engine() -> RAGEngine:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGEngine()
    return _rag_engine
