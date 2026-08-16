from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    settings: Dict[str, Any]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class AdminUserResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: EmailStr
    role: str
    created_at: datetime
    total_resumes_uploaded: int

    class Config:
        from_attributes = True

class AdminUserDetailResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: EmailStr
    role: str
    created_at: datetime
    settings: Dict[str, Any]
    resumes: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True
