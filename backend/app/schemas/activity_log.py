from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    description: str
    created_at: datetime
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ActivityLogListResponse(BaseModel):
    total: int
    logs: List[ActivityLogResponse]
