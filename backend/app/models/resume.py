from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    parsed_text = Column(Text, nullable=True)
    
    # JSON containing structured details: skills, education, experience, ATS recommendations
    extracted_data = Column(JSON, default=lambda: {
        "skills": [],
        "education": [],
        "experience": [],
        "contact_info": {},
        "ats_score": 0,
        "ats_feedback": []
    })
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
