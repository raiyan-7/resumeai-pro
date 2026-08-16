from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

class TrendPoint(BaseModel):
    date: str
    count: int

class FeatureUsageItem(BaseModel):
    name: str
    value: int

class RecentActivityItem(BaseModel):
    id: int
    user_email: str
    user_name: Optional[str] = None
    action: str
    description: str
    created_at: datetime

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_ats_analyses: int
    total_interviews: int
    
    user_registrations: List[TrendPoint]
    resume_uploads: List[TrendPoint]
    ats_analyses: List[TrendPoint]
    interview_sessions: List[TrendPoint]
    
    feature_usage: List[FeatureUsageItem]
    recent_activity: List[RecentActivityItem]
