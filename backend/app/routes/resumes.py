import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeDetailResponse
from app.authentication.jwt import get_current_user
from app.services.storage import StorageService
from app.services.parser import ParserService
from app.ml.analyzer import analyze_resume_text
from app.services.activity_log import record_activity
from app.services.notification import create_notification, notify_admins

router = APIRouter(prefix="/resumes", tags=["Resumes"])

if os.environ.get("VERCEL") == "1":
    UPLOAD_DIR = "/tmp/uploads"
else:
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
storage_service = StorageService(upload_dir=UPLOAD_DIR)

@router.post("/upload", response_model=ResumeDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Save file securely using StorageService (validates size limit of 10MB and type pdf)
    file_path = storage_service.save_file(file, current_user.id)

    # 2. Extract text and metadata using ParserService (PyMuPDF)
    try:
        parsed_data = ParserService.extract_text_and_metadata(file_path, file.filename)
        raw_text = parsed_data["raw_text"]
        metadata = parsed_data["metadata"]
        
        # Run analyzer
        extracted_data = analyze_resume_text(raw_text)
        # Merge structured metadata (page count, size, etc.) into the JSON payload
        extracted_data["metadata"] = metadata
    except Exception as e:
        # Cleanup file if processing fails
        storage_service.delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process PDF resume contents: {str(e)}"
        )

    # 3. Store upload record in the database
    db_resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=metadata["file_size"],
        parsed_text=raw_text,
        extracted_data=extracted_data
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Trigger notifications
    create_notification(
        db,
        current_user.id,
        "Resume Analysis Completed",
        f"Your resume '{db_resume.filename}' has been analyzed. ATS Score: {extracted_data.get('ats_score')}%",
        "resume_analysis"
    )
    notify_admins(
        db,
        "New Resume Uploaded",
        f"User {current_user.email} uploaded '{db_resume.filename}'.",
        "resume_analysis"
    )
    notify_admins(
        db,
        "Resume Analysis Completed",
        f"Resume analysis for '{db_resume.filename}' completed with {extracted_data.get('ats_score')}% ATS.",
        "resume_analysis"
    )
    record_activity(
        db=db,
        user_id=current_user.id,
        action="Resume Upload",
        description=f"Uploaded resume file: {file.filename} (Pages: {metadata['page_count']}).",
        details={
            "filename": file.filename,
            "resume_id": db_resume.id,
            "page_count": metadata['page_count']
        }
    )
    return db_resume

@router.get("/", response_model=List[ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_detail(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    return resume

@router.get("/{resume_id}/file")
def get_resume_pdf_file(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Serves the original uploaded PDF file for viewing, restricted to owners and admins.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
        
    # Enforce authorization: must be owner OR admin
    if resume.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this file."
        )
        
    # Check if file exists on disk
    if not resume.file_path or not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original PDF resume file was not found on storage disk."
        )
        
    return FileResponse(resume.file_path, media_type="application/pdf")

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
        
    # Delete local file securely if it exists
    storage_service.delete_file(resume.file_path)
            
    db.delete(resume)
    db.commit()
    record_activity(
        db=db,
        user_id=current_user.id,
        action="Resume Deletion",
        description=f"Deleted resume: {resume.filename} (ID: {resume.id}).",
        details={
            "filename": resume.filename,
            "resume_id": resume.id
        }
    )
    return None
