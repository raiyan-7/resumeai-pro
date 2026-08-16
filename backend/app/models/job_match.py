from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    match_score = Column(Float, nullable=False) # e.g. 75.5
    
    # JSON containing analysis: overlapping_skills, missing_skills, recommendations
    match_details = Column(JSON, default=lambda: {
        "matching_skills": [],
        "missing_skills": [],
        "keyword_analysis": {},
        "recommendations": []
    })
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="job_matches")
    resume = relationship("Resume", back_populates="job_matches")
