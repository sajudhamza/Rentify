from sqlalchemy.orm import Session
from passlib.context import CryptContext
from utilities import crud, security

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticates a user by checking username and password.

    Args:
        db (Session): The database session.
        username (str): The username to authenticate.
        password (str): The password to verify.

    Returns:
        The user object if authentication is successful, otherwise None.
    """
    # Use the CRUD function to get the user by their username
    user = crud.get_user_by_username(db, username=username)
    if not user:
        # User not found
        return None
    
    # Use the security utility to verify the provided password against the stored hash
    if not security.verify_password(password, user.hashed_password):
        # Password does not match
        return None
        
    # Authentication successful
    return user
