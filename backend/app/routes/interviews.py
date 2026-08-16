from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.interview import InterviewSession, InterviewMessage
from app.models.resume import Resume
from app.schemas.interview import (
    InterviewSessionCreate,
    InterviewSessionResponse,
    MessageCreate,
    InterviewMessageResponse,
    InterviewSummaryResponse
)
from app.authentication.jwt import get_current_user
from app.ml.coach import generate_first_question, evaluate_response
from app.services.activity_log import record_activity
from app.services.notification import create_notification, notify_admins

router = APIRouter(prefix="/interviews", tags=["Interview Coach"])

@router.post("/", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    request: InterviewSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create session
    session = InterviewSession(
        user_id=current_user.id,
        job_title=request.job_title,
        difficulty=request.difficulty,
        is_active=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Generate initial interview question
    first_question = generate_first_question(request.job_title, request.difficulty)
    
    # Save as coach's first message
    coach_msg = InterviewMessage(
        session_id=session.id,
        sender="coach",
        content=first_question
    )
    db.add(coach_msg)
    db.commit()
    db.refresh(session)
    record_activity(
        db=db,
        user_id=current_user.id,
        action="Interview session started",
        description=f"Initialized practice interview for job '{request.job_title}' ({request.difficulty}).",
        details={
            "session_id": session.id,
            "job_title": request.job_title,
            "difficulty": request.difficulty
        }
    )
    return session

@router.get("/", response_model=List[InterviewSessionResponse])
def get_user_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).all()

@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview_detail(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    return session

@router.post("/{session_id}/message", response_model=List[InterviewMessageResponse])
def submit_interview_message(
    session_id: int,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview session has already been completed."
        )

    # 1. Fetch coach's last message to evaluate response
    last_coach_msg = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == session_id,
        InterviewMessage.sender == "coach"
    ).order_by(InterviewMessage.created_at.desc()).first()
    
    question_content = last_coach_msg.content if last_coach_msg else "Tell me about yourself."

    # 1b. Fetch all coach messages to compile asked questions history
    asked_msgs = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == session_id,
        InterviewMessage.sender == "coach"
    ).all()
    asked_questions = [msg.content for msg in asked_msgs]

    # 1c. Fetch latest user resume skills
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_skills = latest_resume.extracted_data.get("skills", []) if latest_resume and latest_resume.extracted_data else []

    # 2. Evaluate User Answer and generate next question dynamically
    evaluation = evaluate_response(
        question=question_content,
        response=message_in.content,
        job_title=session.job_title,
        difficulty=session.difficulty,
        resume_skills=resume_skills,
        asked_questions=asked_questions
    )
    
    # 3. Save User Message
    user_msg = InterviewMessage(
        session_id=session.id,
        sender="user",
        content=message_in.content,
        feedback=evaluation
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Trigger turn evaluation notification
    create_notification(
        db,
        current_user.id,
        "Interview Evaluation Ready",
        f"Feedback generated for your answer. Score: {evaluation['score']}/10",
        "interview"
    )
    
    # 4. Limit interview to 5 questions (10 messages total)
    total_messages = db.query(InterviewMessage).filter(InterviewMessage.session_id == session_id).count()
    
    new_coach_msg = None
    if total_messages >= 9:
        # Wrap up interview
        session.is_active = False
        db.add(session)
        
        # Trigger completed session notifications
        create_notification(
            db,
            current_user.id,
            "Interview Session Completed",
            f"Mock interview session for '{session.job_title}' completed. Review your overall report.",
            "interview"
        )
        notify_admins(
            db,
            "Interview Session Completed",
            f"User {current_user.email} completed mock interview for '{session.job_title}'.",
            "interview"
        )

        wrap_up_text = (
            "Thank you for completing this practice session! I have compiled your evaluation. "
            "You can review details for each question below. Let's practice again soon!"
        )
        new_coach_msg = InterviewMessage(
            session_id=session.id,
            sender="coach",
            content=wrap_up_text
        )
        db.add(new_coach_msg)
        db.commit()
        db.refresh(new_coach_msg)
    else:
        # Save Coach's follow-up question
        new_coach_msg = InterviewMessage(
            session_id=session.id,
            sender="coach",
            content=evaluation["next_question"]
        )
        db.add(new_coach_msg)
        db.commit()
        db.refresh(new_coach_msg)
        
    return [user_msg, new_coach_msg]

@router.get("/{session_id}/summary", response_model=InterviewSummaryResponse)
def get_interview_session_summary(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Computes and returns a performance summary for a completed practice session.
    """
    # 1. Fetch session and check ownership
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    # 2. Fetch all user messages containing feedback
    user_msgs = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == session_id,
        InterviewMessage.sender == "user"
    ).all()
    
    if not user_msgs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No responses submitted in this session to summarize."
        )
        
    scores = []
    poor_answers = []
    strongest_areas = set()
    weakest_areas = set()
    topics_to_improve = set()
    
    # Track coach messages to pair question content
    coach_msgs = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == session_id,
        InterviewMessage.sender == "coach"
    ).order_by(InterviewMessage.created_at.asc()).all()
    
    for idx, user_msg in enumerate(user_msgs):
        fb = user_msg.feedback
        if fb:
            score = fb.get("score", 5.0)
            scores.append(score)
            
            # Pair with question
            question_text = "Tell me about yourself."
            if idx < len(coach_msgs):
                question_text = coach_msgs[idx].content
                
            # If poor score, flag it
            if score < 6.5:
                poor_answers.append({
                    "question": question_text,
                    "score": score,
                    "feedback": ", ".join(fb.get("areas_for_improvement", ["Needs detail"]))
                })
                weakest_areas.add("Topic Focus")
                for area in fb.get("areas_for_improvement", []):
                    topics_to_improve.add(area)
            else:
                strongest_areas.add("Topic Knowledge")
                
    overall_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    
    # Calculate detailed feedback descriptions
    tech_acc_list = [msg.feedback.get("technical_accuracy", 5.0) for msg in user_msgs if msg.feedback]
    relevance_list = [msg.feedback.get("relevance", 5.0) for msg in user_msgs if msg.feedback]
    clarity_list = [msg.feedback.get("clarity", 5.0) for msg in user_msgs if msg.feedback]
    completeness_list = [msg.feedback.get("completeness", 5.0) for msg in user_msgs if msg.feedback]
    comm_qual_list = [msg.feedback.get("communication_quality", 5.0) for msg in user_msgs if msg.feedback]
    
    avg_tech = sum(tech_acc_list) / len(tech_acc_list) if tech_acc_list else 5.0
    avg_rel = sum(relevance_list) / len(relevance_list) if relevance_list else 5.0
    avg_clar = sum(clarity_list) / len(clarity_list) if clarity_list else 5.0
    avg_comp = sum(completeness_list) / len(completeness_list) if completeness_list else 5.0
    avg_comm = sum(comm_qual_list) / len(comm_qual_list) if comm_qual_list else 5.0
    
    if avg_tech >= 7.5:
        strongest_areas.add("Technical Depth")
        tech_str = "Demonstrates solid understanding of engineering concepts and accurate tech vocabulary."
    else:
        weakest_areas.add("Technical Explanations")
        tech_str = "Needs to focus on explaining architectural designs and specific execution protocols."
        
    if avg_comm >= 7.5:
        strongest_areas.add("Clarity & Form")
        comm_str = "Answers are structured well, utilizing active results-oriented phrasing."
    else:
        weakest_areas.add("Response Structure")
        comm_str = "Answers could be structured more cleanly, utilizing the STAR framework to highlight actions."
        
    # Recommendations list
    recommendations = [
        "Revise the structural components of the STAR method to organize behavioral answers.",
        f"Brush up on core competencies requested by the '{session.job_title}' job role.",
    ]
    if poor_answers:
        recommendations.append("Revisit the model answers for the poorly rated questions below.")
        
    return {
        "overall_score": overall_score,
        "avg_technical_accuracy": round(avg_tech, 1),
        "avg_relevance": round(avg_rel, 1),
        "avg_clarity": round(avg_clar, 1),
        "avg_completeness": round(avg_comp, 1),
        "avg_communication_quality": round(avg_comm, 1),
        "strongest_areas": list(strongest_areas) if strongest_areas else ["Introductory presentation"],
        "weakest_areas": list(weakest_areas) if weakest_areas else ["None identified"],
        "technical_strengths": tech_str,
        "communication_strengths": comm_str,
        "topics_to_improve": list(topics_to_improve) if topics_to_improve else ["Numerical metrics and specific outputs"],
        "poor_answers": poor_answers,
        "recommendations": recommendations
    }

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    db.delete(session)
    db.commit()
    return None
