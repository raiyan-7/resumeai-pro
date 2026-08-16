from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    category: str
) -> Notification:
    """
    Creates and stores a user-specific notification in the database.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def notify_admins(
    db: Session,
    title: str,
    message: str,
    category: str
):
    """
    Broadcasts a notification to all system administrators.
    """
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        create_notification(
            db=db,
            user_id=admin.id,
            title=title,
            message=message,
            category=category
        )
