# ResumeAI — AI-Powered ATS Scoring System

Upload your resume and get an instant ATS score, detailed breakdown, and an AI-improved version.

## Tech Stack
- **Frontend**: Next.js + Tailwind CSS
- **Backend**: FastAPI + Python
- **AI Model**: LLaMA 3.1 (via Ollama locally / Groq API in production)
- **File Parsing**: PyMuPDF + python-docx

## Features
- Instant ATS scoring (0-100) across 7 dimensions
- AI-powered resume rewriting
- Drag-and-drop file upload
- Score analytics dashboard
- 100% free, 100% private (local mode)

## Setup

### Backend
```bash
cd resume-ats-system
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart pymupdf python-docx pytesseract requests pydantic
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Ollama (Local AI)
```bash
ollama pull llama3.1:8b
```

## Pages
- `/` — Landing page
- `/analyze` — Upload & analyze resume
- `/dashboard` — Score analytics

## Team
- **Member 1**: Frontend + Backend Development
- **Member 2**: AI/LLM Integration + Analytics


## License
MIT
