from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.authentication.pwd_hash import verify_password, get_password_hash
from app.authentication.jwt import create_access_token, get_current_user
from app.services.activity_log import record_activity
from app.services.notification import create_notification, notify_admins

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Trigger notifications
    create_notification(db, new_user.id, "Welcome to ResumeAI Pro!", "Welcome! complete your profile and upload your first resume to scan its ATS compatibility.", "system")
    notify_admins(db, "New User Registered", f"New user {new_user.email} has registered in the system.", "system")

    record_activity(
        db=db,
        user_id=new_user.id,
        action="User Registration",
        description=f"User {new_user.email} registered successfully."
    )
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": str(user.id)})
    action_type = "Admin Login" if user.role == "admin" else "User Login"
    record_activity(
        db=db,
        user_id=user.id,
        action=action_type,
        description=f"User {user.email} logged in successfully."
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_details(user_in: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.settings is not None:
        # Merge settings
        merged_settings = current_user.settings.copy() if current_user.settings else {}
        merged_settings.update(user_in.settings)
        current_user.settings = merged_settings
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
