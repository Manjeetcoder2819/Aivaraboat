import os
import logging
from app.rag.parser import FileParser
from app.rag.chunker import Chunker
from app.rag.embedder import get_embedder
from app.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self):
        self.parser = FileParser()
        self.chunker = Chunker()
        self.embedder = get_embedder()
        self.vector_store = VectorStore()

    def ingest_file(self, filepath: str) -> str:
        """
        Parse, chunk, embed, and upload a document to Supabase.
        Returns the created document UUID.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        logger.info(f"Starting ingestion for: {filepath}")
        
        # 1. Parse file content
        parsed = self.parser.parse_file(filepath)
        filename = parsed["filename"]
        title = parsed["title"]
        content = parsed["content"]

        existing = self.vector_store.find_document(filename)
        if existing:
            logger.info("Document already ingested; skipping: %s", filename)
            return existing["id"]

        # 2. Chunk text
        chunks = self.chunker.chunk_text(content)
        if not chunks:
            logger.warning(f"No text extracted from file: {filepath}")
            # Insert document with empty chunks
            return self.vector_store.add_document(filename, title)

        logger.info(f"Split document into {len(chunks)} chunks.")

        # 3. Generate embeddings
        embeddings = self.embedder.embed_documents(chunks)

        # 4. Insert into database
        doc_id = self.vector_store.add_document(filename, title)
        self.vector_store.add_chunks(doc_id, chunks, embeddings)

        logger.info(f"Ingestion completed for document: {filename} (ID: {doc_id})")
        return doc_id
