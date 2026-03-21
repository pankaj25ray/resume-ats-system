from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from app.services.parser import extract_text
from app.services.llm import analyze_resume

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/upload-and-analyze")
async def upload_and_analyze(file: UploadFile = File(...)):
    
    # Validate file type
    allowed_extensions = [".pdf", ".docx", ".doc"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )
    
    # Make sure upload dir exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save uploaded file with unique name
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"File saved: {file_path}")
        
        # Extract text from file
        extracted_text = extract_text(file_path)
        
        if not extracted_text or len(extracted_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text. Please upload a proper PDF or DOCX resume."
            )
        
        print(f"Text extracted successfully — {len(extracted_text)} characters")
        
        # Send to AI for ATS analysis
        analysis = analyze_resume(extracted_text)
        
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
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@router.get("/health")
def health_check():
    return {
        "status": "Resume API is running",
        "model": "groq/llama-3.1-70b"
    }