from typing import Optional, AsyncGenerator
from app.rag.engine import get_rag_engine
from app.rag.streaming import RAGStreamer

class RAGPipeline:
    def __init__(self):
        self.engine = get_rag_engine()
        self.streamer = RAGStreamer(self.engine)

    async def query(self, session_id: str, message: str) -> dict:
        """Standard query-response RAG execution."""
        return await self.engine.query(session_id, message)

    def stream(self, session_id: str, message: str) -> AsyncGenerator[str, None]:
        """Stream RAG response as Server-Sent Events (SSE) events."""
        return self.streamer.stream_response(session_id, message)

_rag_pipeline: Optional[RAGPipeline] = None

def get_rag_pipeline() -> RAGPipeline:
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
