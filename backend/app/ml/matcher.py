import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def match_resume_to_job(
    resume_text: str,
    resume_skills: List[str],
    job_title: str,
    job_description: str
) -> Dict[str, Any]:
    """
    Job Description Matcher.
    Calculates semantic cosine similarity using TF-IDF and computes overlap
    between resume skills and job requirements.
    """
    job_desc_lower = job_description.lower()
    
    # Comprehensive keyword vocabulary for matching
    all_tech_keywords = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node", "express", 
        "fastapi", "django", "flask", "ruby", "rails", "java", "spring", "c++", "c#", "net",
        "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "aws", 
        "gcp", "azure", "docker", "kubernetes", "terraform", "ansible", "jenkins", "git",
        "github", "gitlab", "jira", "confluence", "scrum", "agile", "devops", "ci/cd",
        "machine learning", "deep learning", "nlp", "statistics", "pandas", "numpy",
        "html", "css", "sass", "graphql", "tailwind", "webpack", "babel", "next.js", "nextjs",
        "redux", "context api", "rest", "restful", "api", "apis", "microservices", "serverless",
        "pytest", "unittest", "mocha", "jest", "cypress", "selenium"
    ]
    
    # 1. Parse required skills from the job description
    job_requirements = []
    for kw in all_tech_keywords:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, job_desc_lower):
            job_requirements.append(kw.title())
            
    # Fallback if no vocabulary matches are found
    if not job_requirements:
        job_requirements = [job_title.title()] if job_title else ["Software Engineering"]

    # 2. Map matching vs missing skills
    resume_skills_lower = {s.lower().strip() for s in resume_skills}
    matching_skills = []
    missing_skills = []
    
    for req in job_requirements:
        if req.lower().strip() in resume_skills_lower:
            matching_skills.append(req)
        else:
            missing_skills.append(req)

    # 3. Calculate TF-IDF Cosine Similarity
    res_txt = resume_text or " ".join(resume_skills)
    job_txt = f"{job_title} {job_description}"
    
    tfidf_similarity = 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([res_txt, job_txt])
        sim_matrix = cosine_similarity(tfidf[0:1], tfidf[1:2])
        tfidf_similarity = float(sim_matrix[0][0])
    except Exception:
        # Graceful fallback if vectorizer runs into empty strings or exceptions
        tfidf_similarity = 0.35

    # 4. Formulate Hybrid Compatibility Score
    skills_overlap_pct = (len(matching_skills) / len(job_requirements)) * 100
    
    # Combined score: 60% skills alignment + 40% TF-IDF semantic match
    match_score = (0.6 * skills_overlap_pct) + (0.4 * (tfidf_similarity * 100))
    match_score = round(min(max(match_score, 10.0), 100.0), 1)

    # 5. Measure keyword density metrics
    res_words = res_txt.split()
    job_words = job_txt.split()
    
    res_density = len(resume_skills) / len(res_words) if res_words else 0.05
    job_density = len(job_requirements) / len(job_words) if job_words else 0.08

    # 6. Generate optimization tips
    recommendations = []
    if missing_skills:
        recommendations.append(
            f"Add these missing technical keywords if you have experience with them: {', '.join(missing_skills[:3])}."
        )
        
    if tfidf_similarity < 0.3:
        recommendations.append(
            "Tailor your profile summary and project descriptions to echo the vocabulary of the target job posting."
        )
    else:
        recommendations.append(
            "Contextual keyword vocabulary aligns well with the description. Focus next on quantifying achievements."
        )
        
    recommendations.append(
        "Ensure critical skills are placed in the upper third of your resume where scanners and recruiters look first."
    )

    return {
        "match_score": match_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "keyword_analysis": {
            "resume_keyword_density": round(res_density, 3),
            "job_keyword_density": round(job_density, 3),
            "tfidf_similarity": round(tfidf_similarity, 3)
        },
        "recommendations": recommendations
    }
