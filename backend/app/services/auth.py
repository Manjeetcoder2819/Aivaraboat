"""
AIVARA Auth Service
────────────────────
JWT-based authentication using Supabase Auth.
Provides signup, login, logout, and token validation.
"""

import logging
from fastapi import HTTPException, Header, Depends
from typing import Optional
from app.db.supabase import get_supabase
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
DEMO_EMAIL = "doctor.admin@aivara.ai"
DEMO_FULL_NAME = "Aivara Demo User"


class AuthService:
    def __init__(self):
        self.supabase = get_supabase()

    async def sign_up(self, email: str, password: str, full_name: str = "") -> dict:
        # Bypassed signup for local development
        return {
            "user_id": DEMO_USER_ID,
            "email": email,
            "access_token": "mock-token",
            "refresh_token": "mock-token",
            "message": "Account created successfully.",
        }

    async def sign_in(self, email: str, password: str) -> dict:
        # Bypassed signin for local development
        return {
            "user_id": DEMO_USER_ID,
            "email": email,
            "full_name": DEMO_FULL_NAME,
            "access_token": "mock-token",
            "refresh_token": "mock-token",
        }

    async def sign_out(self, access_token: str) -> dict:
        try:
            self.supabase.auth.sign_out()
            return {"message": "Signed out successfully."}
        except Exception:
            return {"message": "Signed out."}

    async def get_user(self, access_token: str) -> dict:
        # Bypassed for local development
        return {
            "user_id": DEMO_USER_ID,
            "email": DEMO_EMAIL,
            "full_name": DEMO_FULL_NAME,
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        # Bypassed for local development
        return {
            "access_token": "mock-token",
            "refresh_token": "mock-token",
        }


_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service


# ─── FastAPI Dependency: get current user (BYPASSED) ──────────────────

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Bypassed authentication dependency.
    Always returns a mock user database record.
    """
    return {
        "user_id": DEMO_USER_ID,
        "email": DEMO_EMAIL,
        "full_name": DEMO_FULL_NAME
    }


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Return a demo user only when a real auth layer supplies one.

    The local frontend uses ``mock-token`` while auth is bypassed. That token
    maps to the seeded demo user so conversation rows satisfy the user FK.
    """
    if not authorization:
        return None

    return {
        "user_id": DEMO_USER_ID,
        "email": DEMO_EMAIL,
        "full_name": DEMO_FULL_NAME
    }
