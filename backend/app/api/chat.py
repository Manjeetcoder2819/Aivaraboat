from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse, SourceChunk
from app.rag.pipeline import get_rag_pipeline
from app.db.supabase import get_supabase
import json, logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    supabase = get_supabase()
    # Check sessions in the conversations table
    session = supabase.table("conversations").select("id").eq("id", request.session_id).execute()
    if not session.data:
        raise HTTPException(404, "Session not found")
    
    pipeline = get_rag_pipeline()
    return StreamingResponse(
        pipeline.stream(request.session_id, request.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("", response_model=ChatResponse)
async def chat_standard(request: ChatRequest):
    supabase = get_supabase()
    # Check sessions in the conversations table
    session = supabase.table("conversations").select("id").eq("id", request.session_id).execute()
    if not session.data:
        raise HTTPException(404, "Session not found")
        
    try:
        # 1. Insert patient message
        supabase.table("messages").insert({
            "conversation_id": request.session_id,
            "role": "user",
            "content": request.message
        }).execute()
        
        # 2. Run RAG Pipeline
        pipeline = get_rag_pipeline()
        result = await pipeline.query(request.session_id, request.message)
        
        # 3. Insert assistant message with sources
        supabase.table("messages").insert({
            "conversation_id": request.session_id,
            "role": "assistant",
            "content": result["answer"],
            "rag_sources": result["sources"]
        }).execute()
        
        return ChatResponse(
            answer=result["answer"],
            session_id=request.session_id,
            sources=[SourceChunk(**s) for s in result["sources"]],
            memory_used=result["memory_used"],
        )
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(500, str(e))