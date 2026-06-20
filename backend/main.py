"""
AIVARA Backend — FastAPI Application v2
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import get_settings
from app.core.middleware import RequestLoggingMiddleware, GlobalExceptionMiddleware
from app.api import chat, sessions, knowledge, auth, analytics, profile

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="AIVARA API",
    description="AI Healthcare Assistant — RAG-powered backend with streaming & auth",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware (order matters — outermost first) ────────────────────────────
app.add_middleware(GlobalExceptionMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(knowledge.router)
app.include_router(analytics.router)
app.include_router(profile.router)


@app.get("/", tags=["root"])
async def root():
    return {
        "status": "ok",
        "message": "Welcome to the AIVARA API. Interactive documentation is available at /docs."
    }

@app.get("/health", tags=["health"])
async def health():
    return {
        "status":  "ok",
        "service": "AIVARA API",
        "version": "2.0.0",
        "rag":     "streaming + custom pipeline",
    }


@app.on_event("startup")
async def startup():
    logger.info("AIVARA API v2 starting…")
    logger.info(f"Environment:     {settings.app_env}")
    logger.info(f"LLM model:       {settings.llm_model}")
    logger.info(f"Embedding model: {settings.embedding_model}")
    logger.info(f"CORS origins:    {settings.cors_origin_list}")
    logger.info("AIVARA API ready ✓")
