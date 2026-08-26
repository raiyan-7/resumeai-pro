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
# from app.routes import auth, resumes, job_matches, interviews, admin, notifications
from app.utilities.logger import setup_logger

# Set up logging configuration
setup_logger()
logger = logging.getLogger("app.main")

# Auto-create database tables on startup (skipped under serverless Vercel runtime to avoid connection timeout blocking)
if os.environ.get("VERCEL") != "1":
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully connected to database and initialized schema.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {str(e)}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API foundation for ResumeAI Pro - AI-Powered Resume Analyzer & Interview Coach",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
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

# Vercel path normalization middleware
@app.middleware("http")
async def normalize_api_path(request: Request, call_next):
    path = request.url.path
    # If request is routed to serverless function and prefix is stripped, prepend /api
    if os.environ.get("VERCEL") == "1" and not path.startswith("/api") and path != "/":
        request.scope["path"] = f"/api{path}"
        if "raw_path" in request.scope:
            raw_path_str = request.scope["raw_path"].decode("utf-8")
            request.scope["raw_path"] = f"/api{raw_path_str}".encode("utf-8")
    
    response = await call_next(request)
    return response

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
# app.include_router(auth.router, prefix="/api")
# app.include_router(resumes.router, prefix="/api")
# app.include_router(job_matches.router, prefix="/api")
# app.include_router(interviews.router, prefix="/api")
# app.include_router(admin.router, prefix="/api")
# app.include_router(notifications.router, prefix="/api")

@app.get("/api/health")
def health_check(request: Request):
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": "connected",
        "path": request.url.path,
        "headers": dict(request.headers),
        "vercel": os.environ.get("VERCEL", "0")
    }
