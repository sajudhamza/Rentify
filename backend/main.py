from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from typing import List
from databases import models, schemas, database
from utilities import auth, security
from fastapi.staticfiles import StaticFiles
import os
import shutil

# --- Application Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing...")
    # This is a safe place for startup logic that doesn't alter the DB schema.
    yield
    print("Application shutdown: Cleaning up...")

app = FastAPI(lifespan=lifespan)

# --- Static File Serving ---
# Ensure the uploads directory exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# --- CORS Middleware ---
origins = [
    "http://localhost",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.post("/api/login", response_model=schemas.Token, tags=["Authentication"])
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# ===================================================================
# USER ENDPOINTS
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
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/me", response_model=schemas.UserResponse, tags=["Users"])
def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    return current_user

@app.get("/api/users/", response_model=List[schemas.UserResponse], tags=["Users"])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users
    
@app.get("/api/users/{user_id}/items", response_model=List[schemas.ItemResponse], tags=["Users"])
def get_user_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.items

# ===================================================================
# CATEGORY ENDPOINTS
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
# ITEM ENDPOINTS
# ===================================================================
@app.post("/api/items/", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED, tags=["Items"])
def create_item(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user),
    name: str = Form(...),
    description: str = Form(...),
    price_per_day: float = Form(...),
    category_id: int = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    zip_code: str = Form(...),
    image: UploadFile = File(None)
):
    # Check if category exists
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    image_url = None
    if image:
        # Save the uploaded file
        file_path = os.path.join("uploads", image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{image.filename}"
        
    db_item = models.Item(
        name=name,
        description=description,
        price_per_day=price_per_day,
        category_id=category_id,
        city=city,
        state=state,
        zip_code=zip_code,
        image_url=image_url,
        owner_id=current_user.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/", response_model=List[schemas.ItemResponse], tags=["Items"])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

@app.get("/api/items/search", response_model=List[schemas.ItemResponse], tags=["Items"])
def search_items(q: str = "", db: Session = Depends(get_db)):
    items = db.query(models.Item).filter(
        models.Item.name.ilike(f"%{q}%") | models.Item.description.ilike(f"%{q}%")
    ).all()
    return items

@app.get("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
def read_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/api/items/{item_id}", response_model=schemas.ItemResponse, tags=["Items"])
def update_item(
    item_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_active_user),
    name: str = Form(None),
    description: str = Form(None),
    price_per_day: float = Form(None),
    category_id: int = Form(None),
    city: str = Form(None),
    state: str = Form(None),
    zip_code: str = Form(None),
    is_available: bool = Form(None),
    image: UploadFile = File(None)
):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if db_item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
    
    update_data = {
        "name": name, "description": description, "price_per_day": price_per_day,
        "category_id": category_id, "city": city, "state": state, "zip_code": zip_code,
        "is_available": is_available
    }

    for key, value in update_data.items():
        if value is not None:
            setattr(db_item, key, value)
    
    if image:
        file_path = os.path.join("uploads", image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_item.image_url = f"/uploads/{image.filename}"

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# ===================================================================
# BOOKING ENDPOINTS
# ===================================================================
@app.post("/api/items/{item_id}/bookings", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
def create_booking(item_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own item")

    days = (booking.end_date - booking.start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="End date must be after start date.")

    db_booking = models.Booking(
        **booking.model_dump(),
        renter_id=current_user.id,
        item_id=item_id,
        total_price=item.price_per_day * days,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.get("/api/my-bookings", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_bookings(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    return db.query(models.Booking).filter(models.Booking.renter_id == current_user.id).all()

@app.get("/api/my-listings/bookings", response_model=List[schemas.BookingResponse], tags=["Bookings"])
def get_my_listing_bookings(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    return db.query(models.Booking).join(models.Item).filter(models.Item.owner_id == current_user.id).all()

@app.put("/api/bookings/{booking_id}", response_model=schemas.BookingResponse, tags=["Bookings"])
def update_booking_status(booking_id: int, status_update: schemas.BookingStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_active_user)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if db_booking.item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    
    db_booking.status = status_update.status
    db.commit()
    db.refresh(db_booking)
    return db_booking

