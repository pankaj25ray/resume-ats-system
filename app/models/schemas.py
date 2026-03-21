from pydantic import BaseModel
from typing import Optional, List

class ResumeResponse(BaseModel):
    filename: str
    extracted_text: str
    ats_score: int
    score_breakdown: dict
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    improved_summary: str
    status: str