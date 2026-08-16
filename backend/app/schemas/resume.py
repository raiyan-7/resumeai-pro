from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str
    file_size: int

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    extracted_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeDetailResponse(ResumeResponse):
    parsed_text: Optional[str] = None

    class Config:
        from_attributes = True
