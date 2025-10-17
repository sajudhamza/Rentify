from sqlalchemy.orm import Session
from . import crud, passwords 

def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticates a user by checking username/email and password.
    """
    # Use the flexible CRUD function to get user by username OR email
    user = crud.get_user_by_identifier(db, identifier=username)
    if not user:
        # User not found
        return None
    
    # Use the 'passwords' utility to verify the provided password
    if not passwords.verify_password(password, user.hashed_password):
        # Password does not match
        return None
        
    # Authentication successful
    return user

