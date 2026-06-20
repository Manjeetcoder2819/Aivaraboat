import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ingestion import IngestionService
from app.db.supabase import get_supabase

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/documents")
async def list_documents():
    """
    List all ingested medical documents.
    """
    supabase = get_supabase()
    try:
        res = supabase.table("knowledge_documents").select("*").order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete an ingested document and its chunks.
    """
    supabase = get_supabase()
    try:
        # Delete chunks first
        supabase.table("knowledge_chunks").delete().eq("document_id", doc_id).execute()
        # Delete document metadata
        res = supabase.table("knowledge_documents").delete().eq("id", doc_id).execute()
        return {
            "message": "Document and chunks deleted successfully.",
            "document_id": doc_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@router.post("/test-query")
async def test_query(request: dict):
    """
    Search pgvector database directly without LLM completion.
    """
    query_text = request.get("query", "")
    if not query_text:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        from app.rag.engine import get_rag_engine
        engine = get_rag_engine()
        query_embedding = await engine.embed(query_text)
        chunks = await engine.retrieve_chunks(query_embedding)
        return chunks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query search failed: {str(e)}")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a medical knowledge text file and ingest it into the Supabase vector store.
    """
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only plain text (.txt) files are supported.")
    
    # Save the file to data/medical_knowledge
    save_dir = r"C:\Users\Manjeet Gupta\LLM-chatbot_ai\Aivara.ai\backend\data\medical_knowledge"
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, file.filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ingest document
        ingest_service = IngestionService()
        doc_id = ingest_service.ingest_file(filepath)
        
        return {
            "message": "File uploaded and ingested successfully.",
            "document_id": doc_id,
            "filename": file.filename
        }
    except Exception as e:
        # Cleanup file if saved but failed to ingest
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.post("/ingest-path")
async def ingest_from_path(filepath: str):
    """
    Ingest a text file from a local filesystem path.
    """
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File path does not exist.")
    
    try:
        ingest_service = IngestionService()
        doc_id = ingest_service.ingest_file(filepath)
        return {
            "message": "File ingested successfully.",
            "document_id": doc_id,
            "filepath": filepath
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
