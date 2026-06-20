import asyncio
import sys
import os

# Add project root to python path
project_root = r"C:\Users\Manjeet Gupta\LLM-chatbot_ai\Aivara.ai\backend"
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

from app.db.supabase import get_supabase
from app.rag.engine import get_rag_engine

async def test_pipeline():
    print("Initializing Supabase Client...")
    supabase = get_supabase()
    
    # 1. Create a dummy session linked to our mock user ID
    print("Creating dummy conversation...")
    sess_res = supabase.table("conversations").insert({
        "user_id": "00000000-0000-0000-0000-000000000000",
        "title": "Integration Test Session",
        "specialty": "General",
        "mode": "Chat",
        "is_active": True
    }).execute()
    
    if not sess_res.data:
        print("Failed to create conversation session in Supabase.")
        return
        
    sess_id = sess_res.data[0]["id"]
    print(f"Created conversation ID: {sess_id}")
    
    try:
        # 2. Query RAG engine
        print("\nSending query to RAG Engine: 'what are the symptoms of cardiovascular disease?'")
        engine = get_rag_engine()
        result = await engine.query(sess_id, "what are the symptoms of cardiovascular disease?")
        
        print("\n--- RAG Response ---")
        print(result["answer"])
        
        print("\n--- Matched Chunks ---")
        for chunk in result["sources"]:
            print(f"- Title: {chunk['title']} (Similarity: {chunk['similarity']})")
            print(f"  Snippet: {chunk['content']}")
            
        print(f"\nMemory Used: {result['memory_used']}")
        
    finally:
        # 3. Cleanup session & memory
        print("\nCleaning up test session...")
        supabase.table("messages").delete().eq("conversation_id", sess_id).execute()
        supabase.table("conversation_memory").delete().eq("conversation_id", sess_id).execute()
        supabase.table("conversations").delete().eq("id", sess_id).execute()
        print("Cleanup done.")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
