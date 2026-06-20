from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ─── Chat Schemas ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str  # maps to conversation_id in db

class SourceChunk(BaseModel):
    document_id: str
    filename: Optional[str] = "Unknown"
    title: Optional[str] = "Unknown"
    content: str
    similarity: float

class ChatResponse(BaseModel):
    answer: str
    session_id: str
    sources: List[SourceChunk] = []
    memory_used: bool = False

# ─── Auth Schemas ────────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = ""
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    message: Optional[str] = None

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    refresh_token: str

# ─── Session/Conversation Schemas ─────────────────────────────────────────────

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    specialty: Optional[str] = "General"
    mode: Optional[str] = "Chat"

class ConversationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: Optional[str] = None
    specialty: Optional[str] = None
    mode: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str
