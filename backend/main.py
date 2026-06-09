from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from groq import Groq
import os

from database import engine, get_db, Base
from models import Conversation
from schemas import MessageRequest, MessageResponse

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/")
def read_root():
    return {"message": "AI Chatbot API is running!"}

@app.post("/chat", response_model=MessageResponse)
def chat(request: MessageRequest, db: Session = Depends(get_db)):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": request.message}
            ]
        )
        bot_response = response.choices[0].message.content

        conversation = Conversation(
            user_message=request.message,
            bot_response=bot_response
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
    return conversations