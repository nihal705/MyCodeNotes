from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import problems, practice, concepts, leetcode, admin, profile
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MyLeetCodeNotes API",
    description="API for MyLeetCodeNotes - Personal LeetCode Knowledge Base",
    version="1.0.0"
)

# CORS configuration - Explicitly allow your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(problems.router)
app.include_router(practice.router)
app.include_router(concepts.router)
app.include_router(leetcode.router)
app.include_router(admin.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to MyLeetCodeNotes API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}