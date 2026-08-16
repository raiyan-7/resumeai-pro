import unittest
from app.ml.matcher import match_resume_to_job

class TestJobMatcher(unittest.TestCase):
    def test_high_similarity_match(self):
        resume_text = "Experienced software engineer specializing in Python and React. Built web APIs using FastAPI and SQL."
        resume_skills = ["Python", "React", "FastAPI", "SQL"]
        job_title = "FastAPI Backend Developer"
        job_description = "Looking for a software engineer to build APIs using Python and FastAPI. Experience with SQL database schema design is required. React knowledge is a plus."
        
        result = match_resume_to_job(
            resume_text=resume_text,
            resume_skills=resume_skills,
            job_title=job_title,
            job_description=job_description
        )
        
        # Verify structure
        self.assertIn("match_score", result)
        self.assertIn("matching_skills", result)
        self.assertIn("missing_skills", result)
        self.assertIn("keyword_analysis", result)
        self.assertIn("recommendations", result)
        
        # Verify correctness
        self.assertTrue(result["match_score"] > 60.0)
        self.assertIn("Python", result["matching_skills"])
        self.assertIn("Fastapi", result["matching_skills"])
        self.assertTrue(result["keyword_analysis"]["tfidf_similarity"] > 0.3)

    def test_low_similarity_match(self):
        resume_text = "Pediatric nurse with five years of experience in critical patient care and medical documentation."
        resume_skills = ["Nursing", "Patient Care", "Healthcare"]
        job_title = "Data Scientist"
        job_description = "Seeking a machine learning engineer to build deep learning models in Python and train transformers using PyTorch."
        
        result = match_resume_to_job(
            resume_text=resume_text,
            resume_skills=resume_skills,
            job_title=job_title,
            job_description=job_description
        )
        
        # Verify correctness
        self.assertTrue(result["match_score"] < 40.0)
        self.assertTrue(result["keyword_analysis"]["tfidf_similarity"] < 0.15)
        # Technical missing skills like Python should be flagged
        self.assertIn("Python", result["missing_skills"])

if __name__ == "__main__":
    unittest.main()
