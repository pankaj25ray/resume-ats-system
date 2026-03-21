from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL from environment variable
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_PQovJDMk1es8@ep-curly-pond-a1wmzhqp-pooler.ap-southeast-1.aws.neon.tech/resumedb?sslmode=require"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ═══════════════════════════════════════
# DATABASE MODELS
# ═══════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=True)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_uploads = Column(Integer, default=0)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(150), nullable=True)
    filename = Column(String(255), nullable=False)
    ats_score = Column(Integer, default=0)
    score_breakdown = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    improved_summary = Column(Text, nullable=True)
    text_preview = Column(Text, nullable=True)
    characters_extracted = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScoreStats(Base):
    __tablename__ = "score_stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    total_resumes = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    highest_score = Column(Integer, default=0)
    lowest_score = Column(Integer, default=100)
    updated_at = Column(DateTime, default=datetime.utcnow)

# ═══════════════════════════════════════
# CREATE ALL TABLES
# ═══════════════════════════════════════

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()