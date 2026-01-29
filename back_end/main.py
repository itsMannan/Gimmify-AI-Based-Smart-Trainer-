import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.ai_engine import get_ai_response, get_intelligent_response
from app.auth import router as auth_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Gimmify Backend API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth Router
app.include_router(auth_router, prefix="/api", tags=["auth"])

class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en-US"
    conversationHistory: Optional[List[Dict[str, str]]] = []

@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "message": "Gimmify FastAPI Backend is running",
        "hasOpenAI": bool(os.getenv("OPENAI_API_KEY"))
    }

@app.post("/api/chat")
async def chat_endpoint(payload: ChatMessage):
    print(f"Received chat message: {payload.message}")
    message = payload.message
    language = payload.language
    history = payload.conversationHistory
    
    # Try AI response first
    ai_response = await get_ai_response(message, history)
    
    if ai_response:
        return {
            "response": ai_response,
            "type": "ai",
            "language": language,
            "source": "openai"
        }
    
    # Fallback response
    print("Using fallback response - AI not available")
    fallback = get_intelligent_response(message, history)
    
    return {
        "response": fallback,
        "type": "fallback",
        "language": language,
        "source": "fallback",
        "note": "For comprehensive, expert-level answers, please set OPENAI_API_KEY in your .env file"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
