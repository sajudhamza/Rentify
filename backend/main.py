from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from databases import models, schemas, database
from utilities import auth, security
from typing import List

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Lifespan event started.")
    # Application startup logic
    yield
    print("Application shutdown: Lifespan event finished.")


app = FastAPI(lifespan=lifespan)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===================================================================
# AUTHENTICATION
# ===================================================================

@app.post("/api/token", response_model=schemas.Token, tags=["Authentication"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post("/api/login", response_model=schemas.Token, tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Handles user login and returns a JWT token along with user details.
    This uses form data (username and password).
    """
    user = auth.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.username})
    
    # We need to shape the user object to match the UserResponse schema
    user_response = schemas.UserResponse.from_orm(user)

    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

# ===================================================================
# USERS
# ===================================================================

@app.post("/api/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/", response_model=List[schemas.UserResponse], tags=["Users"])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/api/users/me", response_model=schemas.UserResponse, tags=["Users"])
def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    return current_user

# ===================================================================
# CATEGORIES
# ===================================================================

@app.post("/api/categories/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED, tags=["Categories"])
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/categories/", response_model=List[schemas.CategoryResponse], tags=["Categories"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

# ===================================================================
# ITEMS
# ===================================================================

@app.post("/api/items/", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED, tags=["Items"])
def create_item(
    item: schemas.ItemCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_active_user)
):
    """
    Creates a new item. Ownership is automatically assigned to the authenticated user.
    """
    db_item = models.Item(**item.model_dump(), owner_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/", response_model=List[schemas.ItemResponse], tags=["Items"])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

@app.get("/api/items/search", response_model=List[schemas.ItemResponse], tags=["Items"])
def search_items(q: str, db: Session = Depends(get_db)):
    items = db.query(models.Item).filter(
        (models.Item.name.ilike(f"%{q}%")) | (models.Item.description.ilike(f"%{q}%"))
    ).all()
    return items
    
@app.get("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
def update_item(
    item_id: int, 
    item_update: schemas.ItemUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
        
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/users/{user_id}/items", response_model=List[schemas.ItemResponse], tags=["Items"])
def get_user_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.items

# ===================================================================
# BOOKINGS
# ===================================================================

@app.post("/api/items/{item_id}/bookings", response_model=schemas.BookingResponse, tags=["Bookings"])
def create_booking_for_item(
    item_id: int,
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user),
):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own item")

    db_booking = models.Booking(
        **booking.model_dump(),
        renter_id=current_user.id,
        item_id=item_id,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@app.get("/api/my-bookings", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user),
):
    bookings = db.query(models.Booking).filter(models.Booking.renter_id == current_user.id).all()
    return bookings


@app.get("/api/my-listings/bookings", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_listing_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user),
):
    bookings = (
        db.query(models.Booking)
        .join(models.Item)
        .filter(models.Item.owner_id == current_user.id)
        .all()
    )
    return bookings


@app.put("/api/bookings/{booking_id}", response_model=schemas.BookingResponse, tags=["Bookings"])
def manage_booking_request(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user),
):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if the current user is the owner of the item being booked
    if db_booking.item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this booking")

    db_booking.status = status_update.status
    db.commit()
    db.refresh(db_booking)
    return db_booking

