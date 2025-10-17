from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# In a real application, this should come from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://rentify_user:your_secure_password@db/rentify_db")


engine = create_engine(DATABASE_URL)

# In a real application, this should come from environment variables
#SQLALCHEMY_DATABASE_URL = "postgresql://rentify_user:your_secure_password@db/rentify_db"

#engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

Base = declarative_base()

# Dependency to get a DB session
def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    It ensures the session is always closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
