# ResumeAI Pro: AI-Powered Resume Analyzer & Interview Coach

ResumeAI Pro is a modern SaaS web application that helps users optimize their resumes for Applicant Tracking Systems (ATS), map skill alignment against target job descriptions, discover missing technological requirements, and practice technical role-specific mock interviews with an AI-guided coach.

This repository contains the complete structural codebase architecture (FastAPI backend + React frontend), featuring database configurations, routing controls, page hierarchies, and reusable UI components.

---

## Scalable Project Architecture

```text
resumeai-pro/
├── backend/
│   ├── app/
│   │   ├── authentication/   # Passlib bcrypt & PyJWT sessions
│   │   ├── database/         # SQLAlchemy session & base setups
│   │   ├── ml/               # Scikit-learn, SpaCy & sentence-transformer stubs
│   │   ├── models/           # User, Resume, JobMatch, Interview DB schemas
│   │   ├── routes/           # REST endpoints controllers
│   │   ├── schemas/          # Pydantic validation objects
│   │   ├── services/         # PyMuPDF text extractor service
│   │   ├── utilities/        # Logging setups
│   │   ├── config.py         # Pydantic BaseSettings loading
│   │   └── main.py           # FastAPI server initialization
│   ├── .env                  # Port, Database & Secret parameters
│   └── requirements.txt      # Python dependencies manifest
│
└── frontend/
    ├── src/
    │   ├── assets/           # Media & logo files
    │   ├── components/       # Button, Card, Input, Loading, Toast UI elements
    │   ├── hooks/            # useAuth, useFetch context hooks
    │   ├── layouts/          # DashboardLayout, AuthLayout structures
    │   ├── pages/            # LandingPage, Login, Dashboard, Match, Coach views
    │   ├── services/         # Fetch API client wrappers for REST endpoints
    │   ├── styles/           # CSS component extensions
    │   ├── utils/            # Date and file helpers, navigation constants
    │   ├── App.jsx           # Root Route mappings setup
    │   ├── index.css         # Tailwind directives & glassmorphism utilities
    │   └── main.jsx          # React viewport mounting
    ├── index.html            # Web SEO metadata & font preconnect links
    ├── tailwind.config.js    # Customized HSL dark themes & animations
    ├── vite.config.js        # Dev proxy target setup
    └── package.json          # React, Tailwind, Framer Motion manifest
```

---

## Installation & Setup

### Backend Execution Setup

1. **Change directory to backend folder**:
   ```bash
   cd backend
   ```

2. **Initialize a virtual environment (optional but recommended)**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install python packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify environment parameters**:
   Verify that a `.env` exists in the `backend/` directory with the following variables:
   ```env
   DATABASE_URL=sqlite:///./resumeai.db
   JWT_SECRET=supersecretjwtsecretkeyforresumeaiprodevelopment123
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   PROJECT_NAME="ResumeAI Pro"
   ```

5. **Start dev server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API documentation will be available locally at:
   - Swagger Docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
   - ReDoc: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

### Frontend Execution Setup

1. **Change directory to frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application. The Vite configuration automatically proxies `/api` requests to the running backend at `http://localhost:8000`.

---

## Production Configurations

### Frontend Deployment (Vercel)
The frontend is pre-configured to build static files into `dist/`. For deploying on Vercel:
1. Configure Vite build command: `npm run build`
2. Set output directory: `dist`
3. If using React Router browser routes, create a `vercel.json` redirection config at the frontend root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Backend Deployment (Render)
For deploying the FastAPI service on Render:
1. Set Environment: `Python`
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Define Env variables (`DATABASE_URL`, `JWT_SECRET`, etc.) inside the render web interface settings panel.
