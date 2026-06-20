from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.models.schemas import ConversationCreate, ConversationResponse
from app.db.supabase import get_supabase
from app.services.auth import get_optional_user, DEMO_USER_ID

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("", response_model=ConversationResponse)
async def create_session(
    request: ConversationCreate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    print("--- create_session called ---")
    print("current_user:", current_user)
    supabase = get_supabase()
    user_id = current_user.get("user_id") if current_user else DEMO_USER_ID
    
    # Ensure the user exists in the users table to prevent FK violations
    try:
        user_check = supabase.table("users").select("id").eq("id", user_id).execute()
        if not user_check.data:
            print(f"User {user_id} not found, creating demo user row using admin client...")
            from supabase import create_client
            from app.core.config import get_settings
            
            settings = get_settings()
            service_key = settings.supabase_service_role_key
            if service_key:
                admin_supabase = create_client(settings.supabase_url, service_key)
                admin_supabase.table("users").insert({
                    "id": user_id,
                    "email": "doctor.admin@aivara.ai",
                    "full_name": "Aivara Demo User",
                    "role": "doctor"
                }).execute()
            else:
                print("Warning: SUPABASE_SERVICE_ROLE_KEY not set. User insert may fail due to RLS.")
                supabase.table("users").insert({
                    "id": user_id,
                    "email": "doctor.admin@aivara.ai",
                    "full_name": "Aivara Demo User",
                    "role": "doctor"
                }).execute()
    except Exception as e:
        print(f"Error checking/creating user: {e}")

    data = {
        "title": request.title,
        "specialty": request.specialty,
        "mode": request.mode,
        "is_active": True,
        "user_id": user_id
    }
    print("Insert data:", data)

    try:
        res = supabase.table("conversations").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create session.")
    except Exception as e:
        print(f"Exception during insert: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    sess = res.data[0]
    return ConversationResponse(
        id=sess["id"],
        user_id=sess.get("user_id"),
        title=sess.get("title"),
        specialty=sess.get("specialty"),
        mode=sess.get("mode"),
        is_active=sess.get("is_active", True),
        created_at=sess.get("created_at") or datetime.utcnow().isoformat(),
        updated_at=sess.get("updated_at") or datetime.utcnow().isoformat()
    )

@router.get("", response_model=List[ConversationResponse])
async def list_sessions(current_user: Optional[dict] = Depends(get_optional_user)):
    supabase = get_supabase()
    query = supabase.table("conversations").select("*").eq("is_active", True)
    
    # If authenticated, filter by user_id. Otherwise return guest conversations
    if current_user:
        query = query.eq("user_id", current_user["user_id"])
    else:
        query = query.is_("user_id", "null")
        
    res = query.order("created_at", desc=True).execute()
    
    out = []
    for sess in (res.data or []):
        out.append(ConversationResponse(
            id=sess["id"],
            user_id=sess.get("user_id"),
            title=sess.get("title"),
            specialty=sess.get("specialty"),
            mode=sess.get("mode"),
            is_active=sess.get("is_active", True),
            created_at=sess.get("created_at") or datetime.utcnow().isoformat(),
            updated_at=sess.get("updated_at") or datetime.utcnow().isoformat()
        ))
    return out

@router.get("/{session_id}", response_model=ConversationResponse)
async def get_session(session_id: str):
    supabase = get_supabase()
    res = supabase.table("conversations").select("*").eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    sess = res.data[0]
    return ConversationResponse(
        id=sess["id"],
        user_id=sess.get("user_id"),
        title=sess.get("title"),
        specialty=sess.get("specialty"),
        mode=sess.get("mode"),
        is_active=sess.get("is_active", True),
        created_at=sess.get("created_at") or datetime.utcnow().isoformat(),
        updated_at=sess.get("updated_at") or datetime.utcnow().isoformat()
    )

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    supabase = get_supabase()
    # Soft delete
    res = supabase.table("conversations").update({"is_active": False}).eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"message": "Session deleted successfully."}


@router.get("/{session_id}/messages")
async def get_session_messages(session_id: str):
    supabase = get_supabase()
    res = (
        supabase.table("messages")
        .select("id, conversation_id, role, content, specialty, rag_sources, tokens_used, created_at")
        .eq("conversation_id", session_id)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data or []

