from pydantic import BaseModel
from datetime import datetime
from typing import List

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageRequest(BaseModel):
    message: str
    conversation_id: int | None = None

class MessageItem(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationDetail(BaseModel):
    id: int
    title: str
    pinned: bool
    created_at: datetime
    messages: List[MessageItem]

    class Config:
        from_attributes = True

class UpdateConversation(BaseModel):
    title: str | None = None
    pinned: bool | None = None