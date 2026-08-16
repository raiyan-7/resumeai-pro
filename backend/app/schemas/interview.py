from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class InterviewSessionCreate(BaseModel):
    job_title: str
    difficulty: Optional[str] = "Intermediate"

class MessageCreate(BaseModel):
    content: str

class InterviewMessageResponse(BaseModel):
    id: int
    session_id: int
    sender: str # "coach" or "user"
    content: str
    feedback: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewSessionResponse(BaseModel):
    id: int
    user_id: int
    job_title: str
    difficulty: str
    is_active: bool
    created_at: datetime
    messages: List[InterviewMessageResponse] = []

    class Config:
        from_attributes = True

class PoorAnswerItem(BaseModel):
    question: str
    score: float
    feedback: str

class InterviewSummaryResponse(BaseModel):
    overall_score: float
    avg_technical_accuracy: float
    avg_relevance: float
    avg_clarity: float
    avg_completeness: float
    avg_communication_quality: float
    strongest_areas: List[str]
    weakest_areas: List[str]
    technical_strengths: str
    communication_strengths: str
    topics_to_improve: List[str]
    poor_answers: List[PoorAnswerItem]
    recommendations: List[str]
