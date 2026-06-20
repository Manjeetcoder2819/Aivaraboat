from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from app.models.schemas import (
    SignUpRequest,
    LoginRequest,
    AuthResponse,
    TokenRefreshRequest,
    TokenRefreshResponse
)
from app.services.auth import get_auth_service, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    service = get_auth_service()
    res = await service.sign_up(
        email=str(request.email),
        password=request.password,
        full_name=request.full_name
    )
    return AuthResponse(**res)

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    service = get_auth_service()
    res = await service.sign_in(
        email=str(request.email),
        password=request.password
    )
    return AuthResponse(**res)

@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Authorization header missing or invalid.")
    token = authorization.split(" ", 1)[1]
    service = get_auth_service()
    return await service.sign_out(token)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(request: TokenRefreshRequest):
    service = get_auth_service()
    res = await service.refresh_token(request.refresh_token)
    return TokenRefreshResponse(**res)