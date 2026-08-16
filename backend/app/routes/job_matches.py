from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job_match import JobMatch
from app.schemas.job_match import JobMatchRequest, JobMatchResponse
from app.authentication.jwt import get_current_user
from app.ml.matcher import match_resume_to_job
from app.services.activity_log import record_activity
from app.services.notification import create_notification, notify_admins

router = APIRouter(prefix="/job-matches", tags=["Job Matching"])

@router.post("/", response_model=JobMatchResponse, status_code=status.HTTP_201_CREATED)
def compare_resume_to_job(
    request: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify resume belongs to user
    resume = db.query(Resume).filter(Resume.id == request.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    # Trigger matching engine
    resume_skills = resume.extracted_data.get("skills", [])
    match_results = match_resume_to_job(
        resume_text=resume.parsed_text or "",
        resume_skills=resume_skills,
        job_title=request.job_title,
        job_description=request.job_description
    )
    
    # Save Job Match History
    db_match = JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=request.job_title,
        job_description=request.job_description,
        match_score=match_results["match_score"],
        match_details=match_results
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    # Trigger notifications
    create_notification(
        db,
        current_user.id,
        "Job Match Result Ready",
        f"Job match completed for '{request.job_title}'. Fit Score: {match_results['match_score']}%",
        "job_match"
    )
    notify_admins(
        db,
        "Job Match Completed",
        f"User {current_user.email} completed job match for '{request.job_title}'. Score: {match_results['match_score']}%",
        "job_match"
    )
    record_activity(
        db=db,
        user_id=current_user.id,
        action="Job Match / ATS analysis",
        description=f"Compared resume '{resume.filename}' with job '{request.job_title}'. Score: {match_results['match_score']}%.",
        details={
            "resume_id": resume.id,
            "job_title": request.job_title,
            "match_score": match_results["match_score"]
        }
    )
    return db_match

@router.get("/", response_model=List[JobMatchResponse])
def get_match_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.created_at.desc()).all()

@router.get("/{match_id}", response_model=JobMatchResponse)
def get_match_detail(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match_record = db.query(JobMatch).filter(JobMatch.id == match_id, JobMatch.user_id == current_user.id).first()
    if not match_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job match history record not found"
        )
    return match_record

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match_record(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match_record = db.query(JobMatch).filter(JobMatch.id == match_id, JobMatch.user_id == current_user.id).first()
    if not match_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job match history record not found"
        )
    db.delete(match_record)
    db.commit()
    return None
