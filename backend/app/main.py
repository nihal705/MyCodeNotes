from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.database import engine, Base
from app.routes import (
    problems, practice, concepts, leetcode, admin, profile, notes,
    auth, ai, invite, admin_ai, user_progress,
)
import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

# Ensure uploads directories exist
Path("uploads/avatars").mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.jobs.cleanup import cleanup_loop
    task = asyncio.create_task(cleanup_loop())
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(
    title="MyCodeNotes API",
    description="API for MyCodeNotes - Personal LeetCode Knowledge Base",
    version="3.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://mycodenotes.vercel.app",
        "https://mycodenotes-git-main.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


def real_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=real_ip, default_limits=["200/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# Serve uploaded files (avatars, etc.)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.include_router(problems.router)
app.include_router(practice.router)
app.include_router(concepts.router)
app.include_router(leetcode.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(notes.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(invite.router)
app.include_router(admin_ai.router)
app.include_router(user_progress.router)


@app.get("/")
def root():
    return {"message": "Welcome to MyCodeNotes API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}