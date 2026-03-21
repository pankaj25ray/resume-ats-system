from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume

app = FastAPI(
    title="AI Resume ATS Scoring System",
    description="Upload your resume and get ATS score powered by LLaMA 3.1",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    resume.router,
    prefix="/api/v1/resume",
    tags=["Resume"]
)

@app.get("/")
def root():
    return {
        "message": "AI Resume ATS System is running! 🚀",
        "version": "1.0.0",
        "docs": "Visit http://127.0.0.1:8000/docs to test the API",
        "health": "Visit http://127.0.0.1:8000/api/v1/resume/health"
    }