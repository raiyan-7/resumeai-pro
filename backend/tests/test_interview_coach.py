import unittest
from app.ml.coach import generate_first_question, generate_next_question, evaluate_response

class TestInterviewCoach(unittest.TestCase):
    def test_first_question_generation(self):
        job_title = "Software Engineer"
        difficulty = "Intermediate"
        q1 = generate_first_question(job_title, difficulty)
        
        self.assertIsNotNone(q1)
        self.assertTrue(len(q1) > 10)
        self.assertIn("walk me through your background", q1.lower())

    def test_non_repeating_questions_in_session(self):
        job_title = "Software Engineer"
        difficulty = "Intermediate"
        resume_skills = ["Python", "React", "Docker", "SQL"]
        
        asked_questions = []
        
        # 1st Question
        q1 = generate_first_question(job_title, difficulty)
        asked_questions.append(q1)
        
        # Generate the next 4 follow-up questions
        for step in range(2, 6):
            next_q = generate_next_question(
                job_title=job_title,
                difficulty=difficulty,
                resume_skills=resume_skills,
                asked_questions=asked_questions
            )
            
            # Check uniqueness
            self.assertNotIn(next_q.strip().lower(), {q.strip().lower() for q in asked_questions})
            
            # Add to history
            asked_questions.append(next_q)
            
        # Verify total unique count is 5
        self.assertEqual(len(asked_questions), 5)
        self.assertEqual(len(set(q.strip().lower() for q in asked_questions)), 5)

    def test_graceful_pool_exhaustion_fallback(self):
        job_title = "Frontend"
        difficulty = "Easy"
        resume_skills = ["React"]
        
        # Seed asked questions with a huge list containing everything in the pools
        # to force exhaustion fallback
        from app.ml.coach import TECHNICAL_POOL, BEHAVIORAL_POOL, HR_POOL, RESUME_SKILL_POOL
        
        exhausted_list = []
        for qs in TECHNICAL_POOL.values():
            exhausted_list.extend(qs)
        exhausted_list.extend(BEHAVIORAL_POOL)
        exhausted_list.extend(HR_POOL)
        exhausted_list.extend(RESUME_SKILL_POOL.values())
        
        # Generate question under complete pool exhaustion
        fallback_q = generate_next_question(
            job_title=job_title,
            difficulty=difficulty,
            resume_skills=resume_skills,
            asked_questions=exhausted_list
        )
        
        self.assertIsNotNone(fallback_q)
        self.assertEqual(
            fallback_q,
            "Can you share how your previous managers or peers would describe your strongest contribution to a project?"
        )

if __name__ == "__main__":
    unittest.main()
