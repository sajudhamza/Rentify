from sqlalchemy.orm import Session
from passlib.context import CryptContext
from databases import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a plain password."""
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticates a user by checking the email and password.
    """
    # Find the user by email instead of username
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
