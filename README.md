# Rentify
Prototype for renthub

Full Stack Dockerized Setup Guide for Rentify

This guide explains how to run the entire Rentify stack—React frontend, Python backend, and PostgreSQL database—using a single Docker Compose command.
Prerequisites

    Docker & Docker Compose: You must have Docker installed on your machine. Download it from the official Docker website.

    Node.js & npm: Required on your local machine to create the initial React project. Download from https://nodejs.org/.

Step 1: Full Stack Project Structure

Organize your project with separate frontend and backend folders. The main docker-compose.yml file lives at the root.

rentify-fullstack/
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── App.jsx         # The main React component
│   ├── Dockerfile          # Dockerfile for the frontend
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── alembic/
│   ├── main.py
│   ├── models.py
│   ├── alembic.ini
│   ├── Dockerfile          # Dockerfile for the backend
│   └── requirements.txt
│
└── docker-compose.yml      # The main file to orchestrate everything

Step 2: Set Up Frontend and Backend Folders

    Backend: Place the Python Dockerfile, requirements.txt, and your Python source code inside the backend/ directory.

    Frontend: Place the React Dockerfile, package.json, and your React source code inside the frontend/ directory.

Step 3: Configure Your Environment

Ensure your configuration files point to the correct Docker service names.

    In backend/alembic.ini: Make sure the URL points to the db service.

    sqlalchemy.url = postgresql://rentify_user:your_secure_password@db/rentify_db

    In your Python code (e.g., backend/main.py): Read the database URL from the environment variable.

    DATABASE_URL = os.getenv("DATABASE_URL")

    In your React code (e.g., frontend/src/App.jsx): Access the API URL from the Vite environment variable.

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

Step 4: Build and Run the Full Stack

This single command will build the images for your frontend and backend, pull the Postgres image, and start all three containers in a connected network.

    Open your terminal in the project's root directory (where docker-compose.yml is located).

    Run the following command:

    docker-compose up --build

    You will see color-coded logs from all three services (frontend, api, db) in your terminal.

Step 5: Access Your Application

Once the containers are running:

    Frontend: Open your browser and go to http://localhost:5173. You will see your React application.

    Backend: Your API is running and accessible at http://localhost:8000. The frontend will automatically connect to it.

Step 6: Running Database Migrations

Database migration commands must be run inside the api container.

    Keep the containers running.

    Open a new terminal window.

    Use docker-compose exec to run Alembic commands:

    # To create a new migration
    docker-compose exec api alembic revision --autogenerate -m "Your migration message"

    # To apply migrations
    docker-compose exec api alembic upgrade head

You now have a fully containerized, full-stack development environment that is easy to manage and share!



Alembic:

docker-compose exec api alembic -c config/alembic.ini revision --autogenerate -m "Add description to categories"

docker-compose exec api alembic -c config/alembic.ini upgrade head