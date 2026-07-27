from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(String, default="Pending")
    completed = Column(Boolean, default=False)
    priority = Column(String, default="Medium")
    category = Column(String, default="General")


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Kimaya")
    role = Column(String, default="Developer")
    goals_summary = Column(String, default="Learn AI and finish projects")
    wake_time = Column(String, default="07:00")
    sleep_time = Column(String, default="23:00")
    busy_hours = Column(String, default="09:00-17:00")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    target_date = Column(String, default="")
    status = Column(String, default="In Progress")
    progress = Column(Integer, default=0) # 0 to 100 percentage


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    next_review = Column(String, nullable=True) # ISO Date format (YYYY-MM-DD)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Integer, default=2) # 1 = Hard, 2 = Medium, 3 = Easy


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, nullable=False) # "user" or "assistant"
    text = Column(String, nullable=False)
    timestamp = Column(String, nullable=False) # YYYY-MM-DDTHH:MM:SS
