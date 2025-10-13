from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from databases import database, models

# --- Configuration ---
# In a real application, load these from a .env file or environment variables
SECRET_KEY = "your-super-secret-key-that-is-very-long-and-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# --- Token Creation ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Token Verification and User Retrieval ---
def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)):
    """Decodes a JWT token and retrieves the user from the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # We use email as the username for authentication
    user = db.query(models.User).filter(models.User.email == username).first()
    if user is None:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise credentials_exception
            
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    """
    Dependency to get the current user and check if they are active.
    This can be used to protect endpoints.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
