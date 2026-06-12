from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
sessions = []

@app.get("/")
def home():
    return {"message": "Focus Guard Backend Running"}

@app.get("/quote")
def get_quote():
    return {
        "quote": "Small progress every day adds up to big results."
    }

@app.post("/session")
def save_session(data: dict):
    sessions.append(data)
    return {"message": "Session saved"}

@app.get("/sessions")
def get_sessions():
    return sessions