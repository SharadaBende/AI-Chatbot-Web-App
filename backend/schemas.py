from pydantic import BaseModel
from datetime import datetime

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    user_message: str
    bot_response: str
    created_at: datetime

    class Config:
        from_attributes = True