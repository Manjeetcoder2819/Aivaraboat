import logging
from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.supabase = get_supabase()

    def add_document(self, filename: str, title: str) -> str:
        """
        Insert a document record into knowledge_documents.
        Returns the created document UUID.
        """
        res = self.supabase.table("knowledge_documents").insert({
            "filename": filename,
            "title": title
        }).execute()
        if not res.data:
            raise Exception("Failed to insert document metadata into Supabase.")
        return res.data[0]["id"]

    def find_document(self, filename: str) -> dict | None:
        """Return an already-ingested document with this filename, if present."""
        res = (
            self.supabase.table("knowledge_documents")
            .select("id,filename,title")
            .eq("filename", filename)
            .limit(1)
            .execute()
        )
        return res.data[0] if res.data else None

    def add_chunks(self, document_id: str, chunks: list[str], embeddings: list[list[float]]) -> None:
        """
        Batch insert chunks and their corresponding embeddings into knowledge_chunks.
        """
        if not chunks or not embeddings:
            return

        data = [
            {
                "document_id": document_id,
                "content": chunk,
                "embedding": emb
            }
            for chunk, emb in zip(chunks, embeddings)
        ]

        # Insert in batches of 100 to prevent Supabase payload size limits
        batch_size = 100
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            self.supabase.table("knowledge_chunks").insert(batch).execute()

        logger.info(f"Successfully ingested {len(chunks)} chunks for document UUID {document_id}")
