import os
import sys

# Inject backend path for Vercel serverless deployment module resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request, HTTPException as FastAPIHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database.base import Base
from app.database.session import engine
from app.routes import auth, resumes, job_matches, interviews, admin, notifications
from app.utilities.logger import setup_logger

# Set up logging configuration
setup_logger()
logger = logging.getLogger("app.main")

# Auto-create SQLite database tables on startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Successfully connected to database and initialized schema.")
except Exception as e:
    logger.error(f"Failed to initialize database tables: {str(e)}")

api_prefix = "" if os.environ.get("VERCEL") == "1" else "/api"

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API foundation for ResumeAI Pro - AI-Powered Resume Analyzer & Interview Coach",
    version="1.0.0",
    docs_url=f"{api_prefix}/docs",
    redoc_url=f"{api_prefix}/redoc",
    openapi_url=f"{api_prefix}/openapi.json"
)

# CORS configuration loaded from environment variables
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (FastAPIHTTPException, StarletteHTTPException)):
        raise exc
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )

# Register routers
app.include_router(auth.router, prefix=api_prefix)
app.include_router(resumes.router, prefix=api_prefix)
app.include_router(job_matches.router, prefix=api_prefix)
app.include_router(interviews.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)

@app.get(f"{api_prefix}/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": "connected"
    }
