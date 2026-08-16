from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
import logging

logger = logging.getLogger("app.activity")

def record_activity(db: Session, user_id: int, action: str, description: str, details: dict = None):
    """
    Saves an audit activity record to the SQLite database.
    """
    try:
        log = ActivityLog(
            user_id=user_id,
            action=action,
            description=description,
            details=details
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        logger.info(f"Recorded activity log: [{action}] for User {user_id}")
        return log
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to record activity log [{action}] for User {user_id}: {str(e)}")
        return None
