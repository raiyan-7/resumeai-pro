import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.models.user import User
from app.models.notification import Notification
from app.services.notification import create_notification, notify_admins
from app.routes.notifications import (
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    delete_notification,
    clear_user_notifications
)
from fastapi import HTTPException

# In-memory SQLite DB for testing
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestNotificationSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.db = TestingSessionLocal()
        
        # Seed users
        self.user_a = User(email="usera@example.com", hashed_password="pw", role="user")
        self.user_b = User(email="userb@example.com", hashed_password="pw", role="user")
        self.admin = User(email="admin@example.com", hashed_password="pw", role="admin")
        
        self.db.add(self.user_a)
        self.db.add(self.user_b)
        self.db.add(self.admin)
        self.db.commit()
        
        self.db.refresh(self.user_a)
        self.db.refresh(self.user_b)
        self.db.refresh(self.admin)

    def tearDown(self):
        self.db.query(Notification).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_notification_creation_and_isolation(self):
        # 1. Create notification for User A
        n_a = create_notification(
            db=self.db,
            user_id=self.user_a.id,
            title="Analysis Complete",
            message="Resume analyzed successfully.",
            category="resume_analysis"
        )
        
        # 2. Query notifications for User A -> Should return 1 notification
        notifs_a = get_user_notifications(db=self.db, current_user=self.user_a)
        self.assertEqual(len(notifs_a), 1)
        self.assertEqual(notifs_a[0].id, n_a.id)

        # 3. Query notifications for User B -> Should return 0 notifications (Isolation check)
        notifs_b = get_user_notifications(db=self.db, current_user=self.user_b)
        self.assertEqual(len(notifs_b), 0)

    def test_mark_read_authorization_and_ownership(self):
        # Create notification for User A
        n_a = create_notification(
            db=self.db,
            user_id=self.user_a.id,
            title="Match complete",
            message="Job match compiled.",
            category="job_match"
        )
        
        # User B attempts to mark User A's notification as read -> 403 Forbidden
        with self.assertRaises(HTTPException) as context:
            mark_notification_read(
                notification_id=n_a.id,
                db=self.db,
                current_user=self.user_b
            )
        self.assertEqual(context.exception.status_code, 403)
        self.assertFalse(n_a.is_read)

        # User A marks own notification as read -> Allowed
        result = mark_notification_read(
            notification_id=n_a.id,
            db=self.db,
            current_user=self.user_a
        )
        self.assertTrue(result.is_read)

    def test_delete_notification_isolation(self):
        # Create notification for User A
        n_a = create_notification(
            db=self.db,
            user_id=self.user_a.id,
            title="Security alert",
            message="Profile updated.",
            category="security"
        )
        
        # User B attempts to delete User A's notification -> 403 Forbidden
        with self.assertRaises(HTTPException) as context:
            delete_notification(
                notification_id=n_a.id,
                db=self.db,
                current_user=self.user_b
            )
        self.assertEqual(context.exception.status_code, 403)

        # User A deletes own notification -> Allowed
        delete_notification(
            notification_id=n_a.id,
            db=self.db,
            current_user=self.user_a
        )
        
        # Verify deleted
        count = self.db.query(Notification).filter(Notification.id == n_a.id).count()
        self.assertEqual(count, 0)

    def test_admin_broadcast(self):
        # Broadcast notification to admins
        notify_admins(
            db=self.db,
            title="System Alert",
            message="Server reboot scheduled.",
            category="system"
        )
        
        # Query admin's notifications -> Should return 1 notification
        admin_notifs = get_user_notifications(db=self.db, current_user=self.admin)
        self.assertEqual(len(admin_notifs), 1)
        self.assertEqual(admin_notifs[0].title, "System Alert")
        
        # Query normal User A's notifications -> Should return 0 (Admins only)
        user_notifs = get_user_notifications(db=self.db, current_user=self.user_a)
        self.assertEqual(len(user_notifs), 0)

if __name__ == "__main__":
    unittest.main()
