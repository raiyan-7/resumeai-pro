import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.models.user import User
from app.models.interview import InterviewSession, InterviewMessage
from app.ml.coach import evaluate_response, generate_first_question, generate_next_question
from app.routes.interviews import get_interview_session_summary
from fastapi import HTTPException

# In-memory SQLite for testing DB operations
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestInterviewCoachIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.db = TestingSessionLocal()
        # Seed test users
        self.user_a = User(email="usera@example.com", hashed_password="hashed_password")
        self.user_b = User(email="userb@example.com", hashed_password="hashed_password")
        self.db.add(self.user_a)
        self.db.add(self.user_b)
        self.db.commit()
        self.db.refresh(self.user_a)
        self.db.refresh(self.user_b)

    def tearDown(self):
        self.db.query(InterviewMessage).delete()
        self.db.query(InterviewSession).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_session_creation_and_flow(self):
        # 1. Create Interview Session for User A
        session = InterviewSession(
            user_id=self.user_a.id,
            job_title="Frontend Engineer",
            difficulty="Intermediate",
            is_active=True
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        self.assertEqual(session.job_title, "Frontend Engineer")
        self.assertTrue(session.is_active)
        
        # 2. First Question Generation
        q1 = generate_first_question(session.job_title, session.difficulty)
        coach_msg = InterviewMessage(
            session_id=session.id,
            sender="coach",
            content=q1
        )
        self.db.add(coach_msg)
        self.db.commit()
        
        # 3. Answer Submission & Multi-metric Evaluation
        user_response = "I am a frontend developer with 3 years of experience in React and state management. I designed web pages."
        asked_questions = [q1]
        
        evaluation = evaluate_response(
            question=q1,
            response=user_response,
            job_title=session.job_title,
            difficulty=session.difficulty,
            resume_skills=["React", "Redux"],
            asked_questions=asked_questions
        )
        
        # Validate detailed metric outputs
        self.assertIn("technical_accuracy", evaluation)
        self.assertIn("relevance", evaluation)
        self.assertIn("clarity", evaluation)
        self.assertIn("completeness", evaluation)
        self.assertIn("communication_quality", evaluation)
        self.assertIn("example_answer", evaluation)
        
        # Check scores bounding
        self.assertTrue(1.0 <= evaluation["technical_accuracy"] <= 10.0)
        self.assertTrue(1.0 <= evaluation["communication_quality"] <= 10.0)
        
        # 4. Save User Response with feedback
        user_msg = InterviewMessage(
            session_id=session.id,
            sender="user",
            content=user_response,
            feedback=evaluation
        )
        self.db.add(user_msg)
        self.db.commit()
        
        # 5. Session summary retrieval and aggregation
        summary = get_interview_session_summary(
            session_id=session.id,
            db=self.db,
            current_user=self.user_a
        )
        
        self.assertIsNotNone(summary)
        self.assertEqual(summary["overall_score"], evaluation["score"])
        self.assertIn("avg_technical_accuracy", summary)
        self.assertIn("avg_communication_quality", summary)
        self.assertTrue(len(summary["recommendations"]) > 0)

    def test_duplicate_question_prevention(self):
        asked = ["Describe a situation where you had to work under a tight deadline with incomplete requirements. How did you proceed?"]
        
        # Generate next question (step 3 is behavioral)
        next_q = generate_next_question(
            job_title="Software Engineer",
            difficulty="Intermediate",
            resume_skills=["Python"],
            asked_questions=asked
        )
        
        self.assertNotEqual(next_q, asked[0])

    def test_user_isolation(self):
        # Create session belonging to User A
        session_a = InterviewSession(
            user_id=self.user_a.id,
            job_title="Backend Engineer",
            difficulty="Hard",
            is_active=True
        )
        self.db.add(session_a)
        self.db.commit()
        
        # User B attempts to access User A's session summary
        # Should raise 404/403 HTTP exception
        with self.assertRaises(HTTPException) as context:
            get_interview_session_summary(
                session_id=session_a.id,
                db=self.db,
                current_user=self.user_b
            )
            
        self.assertEqual(context.exception.status_code, 404)

if __name__ == "__main__":
    unittest.main()
