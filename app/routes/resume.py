from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import shutil
import os
import uuid
from app.services.parser import extract_text
from app.services.llm import analyze_resume
from app.database import get_db, ResumeAnalysis, User, ScoreStats
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/upload-and-analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    email: str = None,
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_extensions = [".pdf", ".docx", ".doc"]
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text(file_path)

        if not extracted_text or len(extracted_text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        # AI Analysis
        analysis = analyze_resume(extracted_text)

        # Save to database
        try:
            resume_record = ResumeAnalysis(
                user_email=email,
                filename=file.filename,
                ats_score=analysis.get("ats_score", 0),
                score_breakdown=analysis.get("score_breakdown", {}),
                strengths=analysis.get("strengths", []),
                weaknesses=analysis.get("weaknesses", []),
                suggestions=analysis.get("suggestions", []),
                improved_summary=analysis.get("improved_summary", ""),
                text_preview=extracted_text[:300],
                characters_extracted=len(extracted_text),
                created_at=datetime.utcnow()
            )
            db.add(resume_record)

            # Update global stats
            total = db.query(func.count(ResumeAnalysis.id)).scalar() or 0
            avg = db.query(func.avg(ResumeAnalysis.ats_score)).scalar() or 0
            highest = db.query(func.max(ResumeAnalysis.ats_score)).scalar() or 0
            lowest = db.query(func.min(ResumeAnalysis.ats_score)).scalar() or 100

            stats = db.query(ScoreStats).first()
            if stats:
                stats.total_resumes = total + 1
                stats.average_score = round(float(avg), 1)
                stats.highest_score = highest
                stats.lowest_score = lowest
                stats.updated_at = datetime.utcnow()
            else:
                stats = ScoreStats(
                    total_resumes=1,
                    average_score=float(analysis.get("ats_score", 0)),
                    highest_score=analysis.get("ats_score", 0),
                    lowest_score=analysis.get("ats_score", 0),
                    updated_at=datetime.utcnow()
                )
                db.add(stats)

            # Update user if email provided
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    user.total_uploads += 1
                else:
                    user = User(email=email, total_uploads=1)
                    db.add(user)

            db.commit()
            print("Data saved to database!")

        except Exception as db_error:
            print(f"Database save error: {str(db_error)}")
            db.rollback()

        return {
            "filename": file.filename,
            "characters_extracted": len(extracted_text),
            "text_preview": extracted_text[:300] + "...",
            "analysis": analysis,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@router.get("/health")
def health_check():
    return {"status": "Resume API is running", "model": "groq/llama-3.3-70b"}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    stats = db.query(ScoreStats).first()
    total = db.query(func.count(ResumeAnalysis.id)).scalar() or 0
    
    # Score distribution - count all resumes in each range
    dist_90_100 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score >= 90).scalar() or 0
    dist_80_89 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score >= 80, ResumeAnalysis.ats_score < 90).scalar() or 0
    dist_70_79 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score >= 70, ResumeAnalysis.ats_score < 80).scalar() or 0
    dist_60_69 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score >= 60, ResumeAnalysis.ats_score < 70).scalar() or 0
    dist_50_59 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score >= 50, ResumeAnalysis.ats_score < 60).scalar() or 0
    dist_0_49 = db.query(func.count(ResumeAnalysis.id)).filter(ResumeAnalysis.ats_score < 50).scalar() or 0

    return {
        "total_resumes": total,
        "average_score": round(float(stats.average_score), 1) if stats else 0,
        "highest_score": stats.highest_score if stats else 0,
        "lowest_score": stats.lowest_score if stats else 0,
        "score_distribution": {
            "90-100": dist_90_100,
            "80-89": dist_80_89,
            "70-79": dist_70_79,
            "60-69": dist_60_69,
            "50-59": dist_50_59,
            "0-49": dist_0_49
        }
    }

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    results = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(20).all()

    return {
        "history": [
            {
                "id": r.id,
                "ats_score": r.ats_score,
                "score_breakdown": r.score_breakdown,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in results
        ]
    }