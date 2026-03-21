from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume
from app.database import init_db
import os

# Create folders
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

app = FastAPI(
    title="AI Resume ATS Scoring System",
    description="Upload your resume and get ATS score powered by LLaMA 3.3",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
def startup():
    init_db()

app.include_router(
    resume.router,
    prefix="/api/v1/resume",
    tags=["Resume"]
)

@app.get("/")
def root():
    return {
        "message": "AI Resume ATS System is running!",
        "version": "1.0.0"
    }