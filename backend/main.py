# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from routes import authentication, user, item, booking, category

# --- Application Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing...")
    yield
    print("Application shutdown: Cleaning up...")

app = FastAPI(lifespan=lifespan)

# --- Static File Serving ---
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- CORS Middleware ---
# origins = [
#     "http://localhost",
#     "http://localhost:5173",
# ]
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
# Note: The prefix for each router is set in its own file.
# The `/api` prefix is added here for all routes.
app.include_router(authentication.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(item.router, prefix="/api")
app.include_router(category.router, prefix="/api")
app.include_router(booking.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rentify API"}