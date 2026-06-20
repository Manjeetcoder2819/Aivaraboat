from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from app.db.supabase import get_supabase
from app.services.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class HealthProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    family_history: Optional[List[str]] = None

@router.get("")
async def get_profile(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = current_user["user_id"]
    try:
        res = supabase.table("health_profiles").select("*").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
    except Exception as e:
        pass
    return {
        "age": None,
        "gender": None,
        "blood_type": None,
        "allergies": [],
        "chronic_conditions": [],
        "current_medications": [],
        "family_history": []
    }

@router.put("")
async def update_profile(
    profile: HealthProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase()
    user_id = current_user["user_id"]
    
    data = {
        "age": profile.age,
        "gender": profile.gender,
        "blood_type": profile.blood_type,
        "allergies": profile.allergies or [],
        "chronic_conditions": profile.chronic_conditions or [],
        "current_medications": profile.current_medications or [],
        "family_history": profile.family_history or []
    }
    
    try:
        # Check if profile exists
        existing = supabase.table("health_profiles").select("id").eq("user_id", user_id).execute()
        if existing.data:
            res = supabase.table("health_profiles").update(data).eq("user_id", user_id).execute()
        else:
            data["user_id"] = user_id
            res = supabase.table("health_profiles").insert(data).execute()
            
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to save profile.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
