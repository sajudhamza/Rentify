from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Get the database URL from the environment variable set in docker-compose.yml
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgresserver/db")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
