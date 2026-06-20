import json
import logging
from typing import AsyncGenerator
from app.rag.engine import RAGEngine

logger = logging.getLogger(__name__)

class RAGStreamer:
    def __init__(self, engine: RAGEngine):
        self.engine = engine

    async def stream_response(self, session_id: str, question: str) -> AsyncGenerator[str, None]:
        """
        Stream chatbot responses token-by-token as Server-Sent Events (SSE).
        Format:
        - First chunk: metadata (sources list, whether memory was used)
        - Subsequent chunks: content tokens
        - Terminating chunk: [DONE]
        """
        try:
            # 0. Insert patient message immediately into messages table
            self.engine.supabase.table("messages").insert({
                "conversation_id": session_id,
                "role": "user",
                "content": question
            }).execute()

            # 1. Embed query
            query_embedding = await self.engine.embed(question)

            # 2. Parallel retrieval
            chunks = await self.engine.retrieve_chunks(query_embedding)
            memories = await self.engine.retrieve_memories(query_embedding)
            history = await self.engine.get_session_history(session_id)

            # 3. Enrich chunks
            chunks = await self.engine.enrich_chunks(chunks)

            # 4. Build prompt
            system_prompt = self.engine.build_system_prompt()
            user_prompt = self.engine.build_user_prompt(question, chunks, memories, history)

            # 5. Build source list
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

            # Yield sources/metadata metadata immediately
            metadata_event = {
                "type": "metadata",
                "sources": sources,
                "memory_used": len(memories) > 0
            }
            yield f"data: {json.dumps(metadata_event)}\n\n"

            # 6. Generate locally, using true streaming
            answer_text = ""
            async for chunk in self.engine.llm.generate_stream(system_prompt, user_prompt):
                if chunk:
                    answer_text += chunk
                    content_event = {
                        "type": "content",
                        "content": chunk
                    }
                    yield f"data: {json.dumps(content_event)}\n\n"

            # 7. Update memory
            await self.engine.update_memory(session_id, question, answer_text)

            # 8. Insert assistant message with sources into messages table
            self.engine.supabase.table("messages").insert({
                "conversation_id": session_id,
                "role": "assistant",
                "content": answer_text,
                "rag_sources": sources
            }).execute()

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Streaming error: {e}", exc_info=True)
            error_event = {
                "type": "error",
                "error": str(e)
            }
            yield f"data: {json.dumps(error_event)}\n\n"
            yield "data: [DONE]\n\n"
