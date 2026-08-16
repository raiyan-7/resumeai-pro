import random
from typing import Dict, Any, List

# --- Core Question Pools ---

TECHNICAL_POOL = {
    "software engineer": [
        "Explain the difference between a process and a thread. When would you use one over the other?",
        "How do you design a database schema to handle high write traffic while maintaining consistency?",
        "Can you describe how JWT-based authentication works and explain its pros and cons?",
        "What are the key differences between SQL and NoSQL databases? When would you choose one over the other?",
        "Explain the concept of RESTful API design. What are the best practices for designing scalable endpoints?",
        "Explain the difference between synchronous and asynchronous programming. What are the benefits of async architectures?",
        "What is dependency injection, and how does FastAPI utilize it to improve modularity?",
        "How does git rebase differ from git merge, and what are the primary trade-offs of using rebase?"
    ],
    "frontend": [
        "How does the virtual DOM work in React, and how does it optimize page rendering performance?",
        "Explain the differences between state and props in React. When would you use context or state management libraries?",
        "What is critical rendering path in CSS/HTML, and how do you optimize frontend page loading speeds?",
        "What is CORS, and how do you handle CORS errors on the frontend?",
        "Explain the difference between server-side rendering (SSR) and client-side rendering (CSR)."
    ],
    "data scientist": [
        "What is the difference between supervised and unsupervised learning? Give examples of both.",
        "How do you handle missing or imbalanced data during training preparation?",
        "Explain the concept of overfitting and how you would prevent it.",
        "How do you evaluate a classification model's performance? What is the difference between precision and recall?",
        "Can you explain how the random forest algorithm handles feature selection and split node decisions?"
    ],
    "product manager": [
        "How would you prioritize features for a new ride-sharing app targeting college campuses?",
        "Can you walk me through a product launch failure you experienced and what you learned from it?",
        "How do you determine whether a design modification is successful? What metrics do you track?",
        "How do you resolve conflicts between design, engineering, and business goals when building a product roadmap?"
    ]
}

BEHAVIORAL_POOL = [
    "Tell me about a challenging technical project you worked on. What was your role and how did you solve difficulties?",
    "How do you handle disagreements or conflicts inside a team environment? Can you give an example?",
    "Can you describe a time when you had to learn a new technology quickly to solve a project blocker?",
    "Tell me about a time you failed or made a mistake. How did you handle it and what did you learn?",
    "Describe a situation where you had to work under a tight deadline with incomplete requirements. How did you proceed?"
]

HR_POOL = [
    "Where do you see yourself in five years? How does this role align with your career goals?",
    "What are your greatest technical strengths and your biggest area for professional growth?",
    "Why are you interested in this specific role and our company?",
    "How do you manage your time and prioritize tasks when balancing multiple projects?",
    "What kind of team environment do you thrive in, and what is your ideal collaboration style?"
]

RESUME_SKILL_POOL = {
    "python": "Since your resume lists Python, explain the difference between lists and tuples in Python. When is a tuple preferred?",
    "react": "Your resume mentions React. How do you manage global state in a large React project, and what are the performance trade-offs?",
    "docker": "As your profile lists containerization, explain the difference between a Docker container and a virtual machine.",
    "kubernetes": "Your resume lists Kubernetes. How do you manage secrets or scale deployments inside a cluster environment?",
    "sql": "Given your experience with databases, explain the difference between clustered and non-clustered indexes.",
    "postgresql": "Given your experience with databases, explain the difference between clustered and non-clustered indexes.",
    "mysql": "Given your experience with databases, explain the difference between clustered and non-clustered indexes.",
    "sqlite": "Given your experience with databases, explain the difference between clustered and non-clustered indexes.",
    "fastapi": "Your resume mentions FastAPI. How does dependency injection work in FastAPI, and how does it help with testing?",
    "node": "Your resume mentions Node.js. Explain how the Node.js event loop works and how it handles asynchronous I/O operations.",
    "express": "Your resume mentions Express.js. Explain how the Node.js event loop works and how it handles asynchronous I/O operations.",
    "django": "Your resume mentions Django. Explain the model-view-template (MVT) architecture and how middleware operates in Django.",
    "aws": "Since you have cloud experience, explain the difference between horizontal and vertical scaling in cloud environments.",
    "gcp": "Since you have cloud experience, explain the difference between horizontal and vertical scaling in cloud environments.",
    "azure": "Since you have cloud experience, explain the difference between horizontal and vertical scaling in cloud environments.",
    "git": "Since you use Git, how do you handle a git merge conflict, and what is git rebase?",
    "machine learning": "Your resume includes machine learning. Explain how gradient descent works in training deep models.",
    "deep learning": "Your resume includes machine learning. Explain how gradient descent works in training deep models.",
    "nlp": "Since you have experience with NLP, explain how TF-IDF or Word Embeddings work to represent text numerically."
}

# --- Generation Logic ---

def generate_first_question(job_title: str, difficulty: str) -> str:
    """
    Returns an appropriate initial interview question to give the user a warm start.
    """
    return "Please walk me through your background, highlight a key technical project from your resume, and explain how it relates to this role."


def generate_next_question(
    job_title: str,
    difficulty: str,
    resume_skills: List[str] = None,
    asked_questions: List[str] = None
) -> str:
    """
    Selects the next question relevant to the job, resume, and difficulty,
    ensuring that no question is repeated in the session.
    """
    asked_set = {q.strip().lower() for q in (asked_questions or [])}
    skills = [s.strip().lower() for s in (resume_skills or [])]
    job_lower = job_title.lower()

    # Determine sequence step based on asked questions length
    step = len(asked_set) + 1  # 2nd, 3rd, 4th, or 5th question

    candidate = None

    # Step 2: Technical/Resume Match
    if step == 2:
        # 1. Try matching resume skills
        for skill in skills:
            if skill in RESUME_SKILL_POOL:
                q = RESUME_SKILL_POOL[skill]
                if q.strip().lower() not in asked_set:
                    candidate = q
                    break
        # 2. Try matching job title categories
        if not candidate:
            for key, questions in TECHNICAL_POOL.items():
                if key in job_lower:
                    avail = [q for q in questions if q.strip().lower() not in asked_set]
                    if avail:
                        candidate = random.choice(avail)
                        break
        # 3. Fallback to general software engineering technical
        if not candidate:
            avail = [q for q in TECHNICAL_POOL["software engineer"] if q.strip().lower() not in asked_set]
            if avail:
                candidate = random.choice(avail)

    # Step 3: Behavioral Question
    elif step == 3:
        avail = [q for q in BEHAVIORAL_POOL if q.strip().lower() not in asked_set]
        if avail:
            candidate = random.choice(avail)

    # Step 4: Project/System Design/Advanced Technical
    elif step == 4:
        # Search for remaining technical questions in job pool
        matched_pool = None
        for key, questions in TECHNICAL_POOL.items():
            if key in job_lower:
                matched_pool = questions
                break
        if not matched_pool:
            matched_pool = TECHNICAL_POOL["software engineer"]

        avail = [q for q in matched_pool if q.strip().lower() not in asked_set]
        if avail:
            candidate = random.choice(avail)
        else:
            # Try any resume skill question not asked yet
            for skill in skills:
                if skill in RESUME_SKILL_POOL:
                    q = RESUME_SKILL_POOL[skill]
                    if q.strip().lower() not in asked_set:
                        candidate = q
                        break

    # Step 5: HR / Career Goals
    elif step == 5:
        avail = [q for q in HR_POOL if q.strip().lower() not in asked_set]
        if avail:
            candidate = random.choice(avail)

    # --- Global Fallbacks in case of pool exhaustion or step mismatch ---
    if not candidate:
        # Combine all pools to find *any* unasked question
        all_candidates = []
        for qs in TECHNICAL_POOL.values():
            all_candidates.extend(qs)
        all_candidates.extend(BEHAVIORAL_POOL)
        all_candidates.extend(HR_POOL)
        all_candidates.extend(RESUME_SKILL_POOL.values())

        avail = [q for q in all_candidates if q.strip().lower() not in asked_set]
        if avail:
            candidate = random.choice(avail)
        else:
            # Ultimate safety fallback
            candidate = "Can you share how your previous managers or peers would describe your strongest contribution to a project?"

    return candidate


# --- Model Example Answers for popular questions ---

EXAMPLE_ANSWERS = {
    "Explain the difference between a process and a thread. When would you use one over the other?": 
        "A process represents an independent executing program with its own private memory space allocated by the operating system. A thread is the smallest unit of execution context inside a process, sharing the parent process's memory space and file handles. You would use multiple processes for isolated, CPU-heavy tasks to avoid shared memory corruption and utilize multi-core parallelism (especially in Python with the GIL). You would use threads for concurrent, lightweight, I/O-bound tasks where sharing state is beneficial (e.g. web servers or database queries).",
    "How do you design a database schema to handle high write traffic while maintaining consistency?":
        "To scale writes while preserving consistency, I would implement: 1. Connection pooling to manage database connections efficiently. 2. Partitioning or Sharding by a hash key to distribute write loads across multiple database instances. 3. Read/Write splitting with strong replication. 4. Normalized schemas with appropriate indexing, avoiding over-indexing since indexing slows down inserts. 5. Using write-ahead logs and queue brokers (e.g., Kafka) to buffer high-frequency writes before committing them to the transactional DB.",
    "Can you describe how JWT-based authentication works and explain its pros and cons?":
        "JWT works by generating a cryptographically signed token containing user claims on successful login, which the client stores (e.g. in cookies or localStorage) and sends in the Authorization header of subsequent requests. The server validates the signature locally without querying the database, enabling stateless scaling. Pros: Stateless, highly scalable, cross-domain friendly. Cons: Difficult to revoke before expiration, payload size can be large, token theft exposes the user unless stored in secure HttpOnly cookies.",
    "What are the key differences between SQL and NoSQL databases? When would you choose one over the other?":
        "SQL databases are relational, table-based, and enforce static schemas with ACID properties, making them ideal for complex queries and transactional consistency. NoSQL databases are non-relational, document/key-value/graph-based, with dynamic schemas, making them ideal for scaling horizontally, storing unstructured data, and rapid model prototyping. Choose SQL for financial transactions; choose NoSQL for real-time big data feeds or catalog management.",
    "Explain the concept of RESTful API design. What are the best practices for designing scalable endpoints?":
        "REST is an architectural style based on stateless, client-server communication using HTTP verbs (GET, POST, PUT, DELETE) representing resource actions. Best practices: use plural nouns for collections (e.g., /api/users), use status codes properly (200, 201, 400, 404, 500), implement pagination/filtering on search collection requests, use resource nesting logically (e.g. /api/users/1/resumes), and enable caching headers to improve throughput.",
    "Explain the difference between synchronous and asynchronous programming. What are the benefits of async architectures?":
        "Synchronous programming executes operations sequentially, blocking execution until the current task completes. Asynchronous programming delegates tasks to an event loop or worker pool, allowing the main thread to run other tasks while waiting for I/O operations. Benefits include high concurrency, efficient resource utilization (single-threaded async scales to thousands of concurrent connections), and reduced CPU overhead under high network wait conditions.",
    "What is dependency injection, and how does FastAPI utilize it to improve modularity?":
        "Dependency injection is a pattern where an object receives its dependent services from external providers rather than instantiating them itself. FastAPI implements this via its `Depends()` dependency management system. FastAPI automatically resolves dependencies hierarchical trees, scopes resource lifespans (like database sessions), simplifies unit testing by allowing developers to override dependencies, and improves code cleanliness.",
    "How does the virtual DOM work in React, and how does it optimize page rendering performance?":
        "The virtual DOM is a lightweight JavaScript representation of the real DOM. When component state changes, React updates the virtual DOM, compares it with the previous snapshot using a diffing algorithm (Reconciliation), and batch updates only the changed parts in the real DOM (Reflow/Repaint minimization). This minimizes expensive direct browser layout recalculations.",
    "Explain the differences between state and props in React. When would you use context or state management libraries?":
        "State is internal, mutable data owned and managed by the component itself, triggering re-renders on change. Props are read-only configuration inputs passed from parent components down the tree. Use Context or State Management libraries (e.g., Redux, Zustand) for global variables shared by many non-adjacent components, avoiding deep prop-drilling.",
    "What is critical rendering path in CSS/HTML, and how do you optimize frontend page loading speeds?":
        "The critical rendering path is the sequence of steps the browser takes to parse HTML, CSS, and JS into pixels on screen (DOM, CSSOM, Render Tree, Layout, Paint). Optimize by: 1. Minifying and compressing assets. 2. Deferring non-critical JS (`async` or `defer`). 3. Inlining critical CSS. 4. Using lazy-loading for offscreen media. 5. Utilizing CDNs.",
    "What is CORS, and how do you handle CORS errors on the frontend?":
        "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a different domain than the one that served it. Handle CORS errors by configuring the backend server to include the `Access-Control-Allow-Origin` headers (listing the frontend domain), or by setting up a local dev proxy (like Vite proxy configuration) or API gateway.",
    "What is the difference between supervised and unsupervised learning? Give examples of both.":
        "Supervised learning trains a model using labeled inputs and known targets (e.g. classification or regression; predicting house prices). Unsupervised learning trains a model on unlabeled datasets to find hidden patterns or groupings (e.g. clustering or dimensionality reduction; customer segmentation).",
    "How do you handle missing or imbalanced data during training preparation?":
        "Handle missing data using imputation (mean, median, KNN) or dropping records if sparse. Handle imbalanced data using: 1. Resampling techniques (Oversampling minority class with SMOTE, or undersampling majority). 2. Class weights in loss functions. 3. Evaluation metrics other than accuracy (F1-score, precision-recall AUC).",
    "Explain the concept of overfitting and how you would prevent it.":
        "Overfitting occurs when a model learns noise and detail in the training dataset so well that it negatively impacts performance on new test data. Prevent it by: 1. Cross-validation. 2. Adding more training data. 3. Regularization (L1/L2 penalties, dropout layers). 4. Simplifying model architecture (fewer features or parameters). 5. Early stopping during epochs.",
    "How would you prioritize features for a new ride-sharing app targeting college campuses?":
        "I would use the RICE framework (Reach, Impact, Confidence, Effort) or MoSCoW method. Features targeting campus specific pain-points (like night shuttle bookings, split fare integrations, and campus ID credential integrations) would score high on Impact and Reach. I'd deliver a Minimum Viable Product (MVP) containing matching rides first, then iterate based on customer feedback.",
    "Please walk me through your background, highlight a key technical project from your resume, and explain how it relates to this role.":
        "A strong introduction should highlight: 1. Professional summary (years of experience, core domains). 2. Key project detailing problem, technologies used, actions taken, and measurable results (STAR method). 3. Technical alignment explaining why your skills in frameworks (e.g. React, FastAPI, SQL) directly fit this target role's expectations."
}

def evaluate_response(
    question: str,
    response: str,
    job_title: str = "Software Engineer",
    difficulty: str = "Intermediate",
    resume_skills: List[str] = None,
    asked_questions: List[str] = None
) -> Dict[str, Any]:
    """
    Evaluates user answers and returns a detailed metric score structure,
    feedback notes, an exemplary model answer, and the next question.
    """
    response_len = len(response.strip())
    response_lower = response.lower()
    feedback_notes = []
    
    # 1. Technical Accuracy Calculation
    # Check if user mentioned technical words relevant to the question
    tech_score = 6.0
    matched_words_count = 0
    
    # Look up example answer to check for keyword overlap
    reference_answer = EXAMPLE_ANSWERS.get(question, "")
    if reference_answer:
        # Extract keywords of length > 4 from reference answer
        ref_words = {w.strip(".,;:?!()").lower() for w in reference_answer.split() if len(w) > 4}
        user_words = {w.strip(".,;:?!()").lower() for w in response.split()}
        overlap = ref_words.intersection(user_words)
        matched_words_count = len(overlap)
        
        if matched_words_count >= 5:
            tech_score = 9.0
        elif matched_words_count >= 2:
            tech_score = 7.5
        else:
            tech_score = 5.0
            feedback_notes.append("Technical accuracy could be improved by mentioning core concept keywords and architectural details.")
    else:
        # Generic technical keyword checks
        general_keywords = ["fastapi", "react", "database", "api", "git", "python", "sql", "testing"]
        found_gen = [w for w in general_keywords if w in response_lower]
        tech_score = min(5.5 + len(found_gen) * 1.0, 9.0)

    # 2. Relevance calculation (Mirroring question text keywords)
    rel_words = {w.strip(".,;:?!()").lower() for w in question.split() if len(w) > 4}
    user_words = {w.strip(".,;:?!()").lower() for w in response.split()}
    rel_overlap = rel_words.intersection(user_words)
    
    relevance = 7.5
    if len(rel_overlap) >= 2:
        relevance = 9.0
    elif response_len < 20:
        relevance = 4.0
        feedback_notes.append("The answer is too brief to address the question context fully.")

    # 3. Clarity calculation (sentence structure)
    clarity = 8.0
    if response_len < 30:
        clarity = 5.0
    elif response_lower.count(".") > 0 and response_len > 80:
        clarity = 9.0
        
    # 4. Completeness calculation (length-based)
    completeness = 5.0
    if response_len > 250:
        completeness = 9.5
    elif response_len > 120:
        completeness = 8.0
        feedback_notes.append("Consider providing a slightly more complete explanation or context to strengthen your answer.")
    else:
        feedback_notes.append("Try using the STAR method (Situation, Task, Action, Result) to expand your answers.")

    # 5. Communication quality (active action verbs density)
    comm_quality = 6.0
    keywords = ["led", "developed", "designed", "impact", "solved", "optimized", "scale", "spearheaded", "architected"]
    found_keywords = [kw for kw in keywords if kw in response_lower]
    comm_quality = min(comm_quality + (len(found_keywords) * 1.0), 10.0)
    if not found_keywords:
        feedback_notes.append("Consider using stronger action-oriented verbs (e.g., 'designed', 'optimized', 'led') to represent your work.")

    # 6. Overall average score
    score = round((tech_score + relevance + clarity + completeness + comm_quality) / 5.0, 1)

    # 7. Model Answer Lookup
    example_answer = reference_answer if reference_answer else (
        "Model Template: In my previous project, we faced a situation where [Situation]. "
        "My task was to [Task]. I solved this by implementing [Action] using specific tools, "
        "which successfully resulted in [Result/Metrics]."
    )

    # Generate the next question ensuring no duplicates
    next_question = generate_next_question(
        job_title=job_title,
        difficulty=difficulty,
        resume_skills=resume_skills,
        asked_questions=asked_questions
    )
        
    return {
        "score": score,
        "technical_accuracy": round(tech_score, 1),
        "relevance": round(relevance, 1),
        "clarity": round(clarity, 1),
        "completeness": round(completeness, 1),
        "communication_quality": round(comm_quality, 1),
        "grammar_feedback": ["Sentence structures are correct. No major errors detected."],
        "key_positives": [
            "Good structure and readability.",
            "Relevant technical concepts identified."
        ],
        "areas_for_improvement": feedback_notes if feedback_notes else ["Excellent formatting and detail."],
        "suggested_phrasing": "Focus on specifying the concrete numerical impact of your technical implementations.",
        "example_answer": example_answer,
        "next_question": next_question
    }

