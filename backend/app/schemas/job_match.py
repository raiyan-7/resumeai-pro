from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class JobMatchRequest(BaseModel):
    resume_id: int
    job_title: str
    job_description: str

class JobMatchResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_title: str
    match_score: float
    match_details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
