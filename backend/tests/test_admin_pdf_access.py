import unittest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.models.user import User
from app.models.resume import Resume
from app.routes.resumes import get_resume_pdf_file
from fastapi import HTTPException

# In-memory SQLite DB for testing
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestAdminPdfAccess(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.db = TestingSessionLocal()
        
        # Seed users with different roles
        self.owner = User(email="owner@example.com", hashed_password="pw", role="user")
        self.non_owner = User(email="nonowner@example.com", hashed_password="pw", role="user")
        self.admin = User(email="admin@example.com", hashed_password="pw", role="admin")
        
        self.db.add(self.owner)
        self.db.add(self.non_owner)
        self.db.add(self.admin)
        self.db.commit()
        
        self.db.refresh(self.owner)
        self.db.refresh(self.non_owner)
        self.db.refresh(self.admin)

        # Create a dummy file on disk
        self.dummy_path = os.path.abspath("test_resume_dummy.pdf")
        with open(self.dummy_path, "w") as f:
            f.write("dummy pdf content")

    def tearDown(self):
        # Cleanup file
        if os.path.exists(self.dummy_path):
            try:
                os.remove(self.dummy_path)
            except Exception:
                pass
                
        self.db.query(Resume).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_owner_access_allowed(self):
        # Seed resume belonging to owner
        resume = Resume(
            user_id=self.owner.id,
            filename="my_resume.pdf",
            file_path=self.dummy_path,
            file_size=100,
            parsed_text="skills python react",
            extracted_data={"skills": ["python", "react"]}
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)

        response = get_resume_pdf_file(
            resume_id=resume.id,
            db=self.db,
            current_user=self.owner
        )
        
        self.assertEqual(response.path, self.dummy_path)
        self.assertEqual(response.media_type, "application/pdf")

    def test_admin_access_allowed(self):
        # Seed resume belonging to owner
        resume = Resume(
            user_id=self.owner.id,
            filename="my_resume.pdf",
            file_path=self.dummy_path,
            file_size=100,
            parsed_text="skills python react",
            extracted_data={"skills": ["python", "react"]}
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)

        response = get_resume_pdf_file(
            resume_id=resume.id,
            db=self.db,
            current_user=self.admin
        )
        
        self.assertEqual(response.path, self.dummy_path)

    def test_non_owner_access_forbidden(self):
        # Seed resume belonging to owner
        resume = Resume(
            user_id=self.owner.id,
            filename="my_resume.pdf",
            file_path=self.dummy_path,
            file_size=100,
            parsed_text="skills python react",
            extracted_data={"skills": ["python", "react"]}
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)

        with self.assertRaises(HTTPException) as context:
            get_resume_pdf_file(
                resume_id=resume.id,
                db=self.db,
                current_user=self.non_owner
            )
            
        self.assertEqual(context.exception.status_code, 403)
        self.assertIn("authorized", context.exception.detail.lower())

if __name__ == "__main__":
    unittest.main()
