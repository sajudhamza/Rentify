from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
import os
from contextlib import asynccontextmanager

# Import your models, schemas, and the database session logic
import models
import schemas
from database import SessionLocal, engine

# --- Lifespan Event ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # We no longer create tables here. Alembic will manage the database schema.
    print("Application startup: Database connection will be managed by requests.")
    yield
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan)

# CORS Middleware Setup
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

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rentify API"}

# --- User Endpoints ---
@app.post("/api/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # In a real app, you would use a library like passlib to securely hash the password.
    # NEVER store plain text passwords in production.
    # For now, we'll simulate hashing to fix the field name mismatch.
    hashed_password = user.password + "_hashed"  # This is a placeholder for actual hashing

    # Create a dictionary of the user data, excluding the plain password
    user_data = user.dict(exclude={"password"})
    
    # Create the User model instance, explicitly passing the hashed_password
    db_user = models.User(**user_data, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# --- Category Endpoints ---
@app.post("/api/categories/", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/categories/", response_model=List[schemas.CategoryResponse])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

# --- Item Endpoints ---
@app.post("/api/items/", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    # Check if owner and category exist before creating the item
    owner = db.query(models.User).filter(models.User.id == item.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail=f"Owner with id {item.owner_id} not found")
    
    category = db.query(models.Category).filter(models.Category.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with id {item.category_id} not found")

    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/", response_model=List[schemas.ItemResponse])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

