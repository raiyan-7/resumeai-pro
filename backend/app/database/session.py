import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings

if os.environ.get("VERCEL") == "1":
    # Mock engine during serverless startup to isolate psycopg2 binary loading crashes
    engine = None
    SessionLocal = None
else:
    # For SQLite, we need connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            settings.DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(settings.DATABASE_URL)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
