from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import models, schemas, database, auth

# --- Lifespan for database initialization ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Database tables will be checked/created if they don't exist.")
    # This is safe for development but for production, you should use Alembic migrations.
    # We keep it here to ensure the app can run out-of-the-box for development.
    try:
        models.Base.metadata.create_all(bind=database.engine)
    except Exception as e:
        print(f"An error occurred during table creation: {e}")
    yield
    print("Application shutdown.")

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

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Rentify API!"}

# --- User and Authentication Endpoints ---

@app.post("/api/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    
    # Create a dictionary of user data, excluding the plain password
    user_data = user.model_dump(exclude={"password"})
    db_user = models.User(**user_data, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/", response_model=list[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.post("/api/login/", response_model=schemas.UserResponse)
def login_user(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# --- Category Endpoints ---

@app.post("/api/categories/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/categories/", response_model=list[schemas.CategoryResponse])
def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

# --- Item Endpoints ---

@app.post("/api/items/", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    # Verify owner exists
    owner = db.query(models.User).filter(models.User.id == item.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail=f"Owner with id {item.owner_id} not found")
    
    # Verify category exists
    category = db.query(models.Category).filter(models.Category.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with id {item.category_id} not found")
        
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/", response_model=list[schemas.ItemResponse])
def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return items

@app.get("/api/items/search", response_model=list[schemas.ItemResponse])
def search_items(q: str = "", db: Session = Depends(get_db)):
    """
    Search for items by name or description.
    """
    if not q:
        return []
    
    search_query = f"%{q}%"
    items = db.query(models.Item).filter(
        (models.Item.name.ilike(search_query)) | (models.Item.description.ilike(search_query))
    ).all()
    
    return items

@app.get("/api/items/{item_id}", response_model=schemas.ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/api/items/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, item_update: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    # In a real app, you would add an authorization check here to ensure
    # the current user is the owner of the item.
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.get("/api/users/{user_id}/items", response_model=List[schemas.ItemResponse])
def get_user_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    items = db.query(models.Item).filter(models.Item.owner_id == user_id).all()
    return items
