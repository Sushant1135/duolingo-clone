import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.routes import api_router

# Initialize SQLite database schema
Base.metadata.create_all(bind=engine)

# Seed database with initial course data and learner profile
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="Duolingo Clone API",
    description="Backend API powering the Duolingo clone learning path, exercises, and gamification loop.",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Duolingo Clone API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
