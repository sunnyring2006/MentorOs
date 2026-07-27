from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    status: str = "Pending"
    completed: bool = False
    priority: str = "Medium"
    category: str = "General"


class TaskResponse(TaskCreate):
    id: int

    class Config:
        from_attributes = True


class GeminiKeyUpdate(BaseModel):
    api_key: str


class UserProfileUpdate(BaseModel):
    name: str
    role: str
    goals_summary: str
    wake_time: str
    sleep_time: str
    busy_hours: str


class UserProfileResponse(UserProfileUpdate):
    id: int

    class Config:
        from_attributes = True


class GoalCreate(BaseModel):
    title: str
    description: str = ""
    target_date: str = ""
    status: str = "In Progress"
    progress: int = 0


class GoalResponse(GoalCreate):
    id: int

    class Config:
        from_attributes = True


class FlashcardCreate(BaseModel):
    question: str
    answer: str
    next_review: str = None
    interval_days: int = 1
    ease_factor: int = 2


class FlashcardResponse(FlashcardCreate):
    id: int

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    sender: str
    text: str
    timestamp: str


class ChatMessageResponse(ChatMessageCreate):
    id: int

    class Config:
        from_attributes = True


class ChatPromptRequest(BaseModel):
    message: str


        