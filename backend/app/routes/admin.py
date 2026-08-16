import os
import shutil
import logging
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job_match import JobMatch
from app.models.interview import InterviewSession
from app.models.activity_log import ActivityLog
from app.authentication.jwt import get_current_admin
from app.schemas.user import AdminUserResponse, AdminUserDetailResponse
from app.schemas.activity_log import ActivityLogListResponse
from app.schemas.analytics import AdminAnalyticsResponse
from app.services.activity_log import record_activity

logger = logging.getLogger("app.admin")

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Returns aggregated counts for system statistics, restricted to admins.
    """
    try:
        total_users = db.query(User).count()
        total_resumes = db.query(Resume).count()
        total_ats = db.query(JobMatch).count()
        total_interviews = db.query(InterviewSession).count()
        
        return {
            "total_users": total_users,
            "total_resumes": total_resumes,
            "total_ats_analyses": total_ats,
            "total_interviews": total_interviews,
            "active_users_today": 3 # Mock static placeholder
        }
    except Exception as e:
        logger.error(f"Error fetching admin stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load admin stats from database."
        )


@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Returns a list of all registered users, restricted to admins.
    """
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        
        # Format the response to calculate resume upload count dynamically
        user_list = []
        for u in users:
            user_list.append({
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at,
                "total_resumes_uploaded": len(u.resumes)
            })
        return user_list
    except Exception as e:
        logger.error(f"Error listing users for admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users from database."
        )


@router.get("/users/{user_id}", response_model=AdminUserDetailResponse)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Returns detailed user profile details and list of resumes, restricted to admins.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    try:
        resumes = []
        for r in user.resumes:
            resumes.append({
                "id": r.id,
                "filename": r.filename,
                "file_size": r.file_size,
                "created_at": r.created_at,
                "ats_score": r.extracted_data.get("ats_score", 0) if r.extracted_data else 0
            })
            
        record_activity(
            db=db,
            user_id=current_admin.id,
            action="Admin profile view",
            description=f"Admin {current_admin.email} viewed user details for {user.email} (ID: {user.id}).",
            details={
                "target_user_id": user.id,
                "target_user_email": user.email
            }
        )
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "settings": user.settings or {},
            "resumes": resumes
        }
    except Exception as e:
        logger.error(f"Error fetching user details for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load user details."
        )


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Deletes a user account and cleans up their storage directory, restricted to admins.
    Admins cannot delete their own account.
    """
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins are not allowed to delete their own account."
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found."
        )
        
    try:
        # Delete user files from local disk securely
        user_dir = os.path.join(UPLOAD_DIR, str(user_id))
        if os.path.exists(user_dir):
            shutil.rmtree(user_dir, ignore_errors=True)
            logger.info(f"Disk storage for user {user_id} removed by admin {current_admin.id}")
            
        # Record Deletion Log BEFORE deleting DB user record
        record_activity(
            db=db,
            user_id=current_admin.id,
            action="Admin user deletion",
            description=f"Admin {current_admin.email} deleted user account {user.email} (ID: {user.id}).",
            details={
                "deleted_user_id": user_id,
                "deleted_user_email": user.email
            }
        )
        
        # Delete user record from database (cascades deletion to Resumes, JobMatches, Interviews in DB)
        db.delete(user)
        db.commit()
        logger.info(f"User account {user_id} deleted from database by admin {current_admin.id}")
        
        return {"message": "User account and all related files deleted successfully."}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting user: {str(e)}"
        )

@router.get("/activity-logs", response_model=ActivityLogListResponse)
def get_activity_logs(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Returns a paginated list of system activity logs, restricted to admins.
    """
    # Defensive pagination guards
    if limit < 1 or limit > 100:
        limit = 50
    if skip < 0:
        skip = 0

    try:
        query = db.query(ActivityLog).join(User, ActivityLog.user_id == User.id)
        
        if search:
            query = query.filter(
                ActivityLog.description.contains(search) |
                ActivityLog.action.contains(search) |
                User.email.contains(search) |
                User.full_name.contains(search)
            )
        if action:
            query = query.filter(ActivityLog.action == action)
        if user_id:
            query = query.filter(ActivityLog.user_id == user_id)
            
        total = query.count()
        logs = query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
        
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                "id": log.id,
                "user_id": log.user_id,
                "user_email": log.user.email,
                "user_name": log.user.full_name,
                "action": log.action,
                "description": log.description,
                "created_at": log.created_at,
                "details": log.details
            })
            
        return {
            "total": total,
            "logs": formatted_logs
        }
    except Exception as e:
        logger.error(f"Error listing activity logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load activity logs from database."
        )

# Helper to generate dates list
def generate_date_dict(days_count: int) -> dict:
    if days_count <= 0:
        return {}
    date_dict = {}
    today = datetime.utcnow().date()
    for i in range(days_count - 1, -1, -1):
        d = today - timedelta(days=i)
        date_dict[d.strftime('%Y-%m-%d')] = 0
    return date_dict

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    range_days: str = "30",
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Returns platform usage aggregations and visual charts history data, restricted to admins.
    """
    try:
        # Calculate totals
        total_users = db.query(User).count()
        total_resumes = db.query(Resume).count()
        total_ats_analyses = db.query(JobMatch).count()
        total_interviews = db.query(InterviewSession).count()

        # Date range logic
        cutoff_date = None
        if range_days == "7":
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            days_diff = 7
        elif range_days == "30":
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            days_diff = 30
        elif range_days == "90":
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            days_diff = 90
        else: # "all"
            earliest_user = db.query(func.min(User.created_at)).scalar()
            if earliest_user:
                days_diff = (datetime.utcnow() - earliest_user).days + 1
                days_diff = min(max(days_diff, 1), 365) # limit to 1 year
            else:
                days_diff = 30
            cutoff_date = None

        # Seed trend dictionaries
        user_trends = generate_date_dict(days_diff)
        resume_trends = generate_date_dict(days_diff)
        ats_trends = generate_date_dict(days_diff)
        interview_trends = generate_date_dict(days_diff)

        # 1. User registrations over time
        user_query = db.query(
            func.strftime('%Y-%m-%d', User.created_at).label('date'),
            func.count(User.id).label('count')
        )
        if cutoff_date:
            user_query = user_query.filter(User.created_at >= cutoff_date)
        for row in user_query.group_by('date').all():
            if row.date in user_trends:
                user_trends[row.date] = row.count

        # 2. Resume uploads over time
        resume_query = db.query(
            func.strftime('%Y-%m-%d', Resume.created_at).label('date'),
            func.count(Resume.id).label('count')
        )
        if cutoff_date:
            resume_query = resume_query.filter(Resume.created_at >= cutoff_date)
        for row in resume_query.group_by('date').all():
            if row.date in resume_trends:
                resume_trends[row.date] = row.count

        # 3. ATS analyses over time
        ats_query = db.query(
            func.strftime('%Y-%m-%d', JobMatch.created_at).label('date'),
            func.count(JobMatch.id).label('count')
        )
        if cutoff_date:
            ats_query = ats_query.filter(JobMatch.created_at >= cutoff_date)
        for row in ats_query.group_by('date').all():
            if row.date in ats_trends:
                ats_trends[row.date] = row.count

        # 4. Interview sessions over time
        interview_query = db.query(
            func.strftime('%Y-%m-%d', InterviewSession.created_at).label('date'),
            func.count(InterviewSession.id).label('count')
        )
        if cutoff_date:
            interview_query = interview_query.filter(InterviewSession.created_at >= cutoff_date)
        for row in interview_query.group_by('date').all():
            if row.date in interview_trends:
                interview_trends[row.date] = row.count

        # Sort and construct TrendPoint lists
        user_trends_list = [{"date": k, "count": v} for k, v in sorted(user_trends.items())]
        resume_trends_list = [{"date": k, "count": v} for k, v in sorted(resume_trends.items())]
        ats_trends_list = [{"date": k, "count": v} for k, v in sorted(ats_trends.items())]
        interview_trends_list = [{"date": k, "count": v} for k, v in sorted(interview_trends.items())]

        # Feature usage list
        feature_usage = [
            {"name": "Resume Upload", "value": total_resumes},
            {"name": "Job Matcher / ATS", "value": total_ats_analyses},
            {"name": "Interview Coach", "value": total_interviews}
        ]

        # Recent activities
        recent_activity_logs = db.query(ActivityLog).join(User, ActivityLog.user_id == User.id)\
                                 .order_by(ActivityLog.created_at.desc()).limit(5).all()
        
        recent_activity = []
        for log in recent_activity_logs:
            recent_activity.append({
                "id": log.id,
                "user_email": log.user.email,
                "user_name": log.user.full_name,
                "action": log.action,
                "description": log.description,
                "created_at": log.created_at
            })

        return {
            "total_users": total_users,
            "total_resumes": total_resumes,
            "total_ats_analyses": total_ats_analyses,
            "total_interviews": total_interviews,
            "user_registrations": user_trends_list,
            "resume_uploads": resume_trends_list,
            "ats_analyses": ats_trends_list,
            "interview_sessions": interview_trends_list,
            "feature_usage": feature_usage,
            "recent_activity": recent_activity
        }
    except Exception as e:
        logger.error(f"Error resolving admin analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute admin analytics aggregates."
        )
