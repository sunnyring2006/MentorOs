import os
import schemas
from fastapi import FastAPI
from gemini_service import get_ai_recommendation
from sqlalchemy.orm import Session
from database import SessionLocal
from fastapi import Depends

import models
from database import engine

models.Base.metadata.create_all(bind=engine)

# Database migrations for priority and category columns
try:
    from sqlalchemy import text
    with engine.begin() as conn:
        result = conn.execute(text("PRAGMA table_info(tasks)")).fetchall()
        columns = [row[1] for row in result]
        if "priority" not in columns:
            conn.execute(text("ALTER TABLE tasks ADD COLUMN priority VARCHAR DEFAULT 'Medium'"))
        if "category" not in columns:
            conn.execute(text("ALTER TABLE tasks ADD COLUMN category VARCHAR DEFAULT 'General'"))
except Exception as e:
    print("Migration warning:", e)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/tasks", response_model=list[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if not task:
        return {"error": "Task not found"}

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}

@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, updated_task: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if not task:
        return {"error": "Task not found"}

    task.title = updated_task.title
    task.status = updated_task.status
    task.completed = updated_task.completed
    task.priority = updated_task.priority
    task.category = updated_task.category

    db.commit()
    db.refresh(task)

    return task

@app.get("/")
def home():
    return {"message": "MentorOS Backend Running 🚀"}

@app.get("/recommend")
def recommend(db: Session = Depends(get_db)):
    try:
        db_tasks = db.query(models.Task).all()
        if not db_tasks:
            tasks_str = "No tasks have been added yet."
        else:
            tasks_str = "\n".join([f"- {t.title} ({t.status}) [Priority: {t.priority}, Category: {t.category}]" for t in db_tasks])

        # Fetch profile if exists
        profile = db.query(models.UserProfile).first()
        recommendation = get_ai_recommendation(tasks_str, profile)

        return {
            "recommendation": recommendation
        }

    except Exception as e:
        return {
            "error": str(e)
        }

@app.get("/settings/gemini-key")
def get_gemini_key_status():
    from dotenv import load_dotenv
    load_dotenv()
    key = os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "" or key.startswith("AQ.Ab") or "YOUR_GEMINI" in key.upper():
        return {"configured": False}
    visible_length = min(len(key), 8)
    masked = key[:visible_length] + "..." + key[-4:] if len(key) > 12 else "Configured"
    return {"configured": True, "masked_key": masked}

@app.post("/settings/gemini-key")
def save_gemini_key(payload: schemas.GeminiKeyUpdate):
    try:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        lines = []
        key_exists = False
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                if line.strip().startswith("GEMINI_API_KEY="):
                    lines[i] = f"GEMINI_API_KEY={payload.api_key}\n"
                    key_exists = True
                    break
        
        if not key_exists:
            lines.append(f"GEMINI_API_KEY={payload.api_key}\n")
            
        with open(env_path, "w") as f:
            f.writelines(lines)
            
        os.environ["GEMINI_API_KEY"] = payload.api_key
        
        return {"status": "success", "message": "API key updated successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ---------------- USER PROFILE ENDPOINTS ----------------

@app.get("/profile", response_model=schemas.UserProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).first()
    if not profile:
        profile = models.UserProfile(
            name="Kimaya",
            role="Student / Developer",
            goals_summary="Finish study tasks and learn modern tech stacks",
            wake_time="07:00",
            sleep_time="23:00",
            busy_hours="09:00-17:00"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/profile", response_model=schemas.UserProfileResponse)
def update_profile(updated: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).first()
    if not profile:
        profile = models.UserProfile()
        db.add(profile)
    
    profile.name = updated.name
    profile.role = updated.role
    profile.goals_summary = updated.goals_summary
    profile.wake_time = updated.wake_time
    profile.sleep_time = updated.sleep_time
    profile.busy_hours = updated.busy_hours
    
    db.commit()
    db.refresh(profile)
    return profile


# ---------------- GOALS ENDPOINTS ----------------

@app.get("/goals", response_model=list[schemas.GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    return db.query(models.Goal).all()

@app.post("/goals", response_model=schemas.GoalResponse)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.put("/goals/{goal_id}", response_model=schemas.GoalResponse)
def update_goal(goal_id: int, updated: schemas.GoalCreate, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        return {"error": "Goal not found"}
    goal.title = updated.title
    goal.description = updated.description
    goal.target_date = updated.target_date
    goal.status = updated.status
    goal.progress = updated.progress
    db.commit()
    db.refresh(goal)
    return goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        return {"error": "Goal not found"}
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}


# ---------------- FLASHCARD ENDPOINTS ----------------

@app.get("/flashcards", response_model=list[schemas.FlashcardResponse])
def get_flashcards(db: Session = Depends(get_db)):
    return db.query(models.Flashcard).all()

@app.post("/flashcards", response_model=schemas.FlashcardResponse)
def create_flashcard(card: schemas.FlashcardCreate, db: Session = Depends(get_db)):
    db_card = models.Flashcard(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@app.put("/flashcards/{card_id}", response_model=schemas.FlashcardResponse)
def update_flashcard(card_id: int, updated: schemas.FlashcardCreate, db: Session = Depends(get_db)):
    card = db.query(models.Flashcard).filter(models.Flashcard.id == card_id).first()
    if not card:
        return {"error": "Flashcard not found"}
    card.question = updated.question
    card.answer = updated.answer
    card.next_review = updated.next_review
    card.interval_days = updated.interval_days
    card.ease_factor = updated.ease_factor
    db.commit()
    db.refresh(card)
    return card

@app.delete("/flashcards/{card_id}")
def delete_flashcard(card_id: int, db: Session = Depends(get_db)):
    card = db.query(models.Flashcard).filter(models.Flashcard.id == card_id).first()
    if not card:
        return {"error": "Flashcard not found"}
    db.delete(card)
    db.commit()
    return {"message": "Flashcard deleted"}


# ---------------- CHAT ENDPOINTS ----------------

@app.get("/chat/history", response_model=list[schemas.ChatMessageResponse])
def get_chat_history(db: Session = Depends(get_db)):
    return db.query(models.ChatMessage).order_by(models.ChatMessage.id.asc()).all()

@app.post("/chat/clear")
def clear_chat_history(db: Session = Depends(get_db)):
    db.query(models.ChatMessage).delete()
    db.commit()
    return {"message": "Chat history cleared"}

@app.post("/chat/send")
def send_chat_message(payload: schemas.ChatPromptRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    
    # Save User message
    user_msg = models.ChatMessage(
        sender="user",
        text=payload.message,
        timestamp=datetime.now().isoformat()
    )
    db.add(user_msg)
    db.commit()
    
    # Fetch chat history (limit to last 15 messages for context size)
    history = db.query(models.ChatMessage).order_by(models.ChatMessage.id.desc()).limit(15).all()
    history.reverse() # Sort in ascending chronological order for the AI prompt
    
    # Get user profile
    profile = db.query(models.UserProfile).first()
    
    # Query Gemini
    from gemini_service import get_ai_chat_response
    ai_response_text = get_ai_chat_response(payload.message, history[:-1], profile)
    
    # Save AI message
    ai_msg = models.ChatMessage(
        sender="assistant",
        text=ai_response_text,
        timestamp=datetime.now().isoformat()
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return {
        "user_message": user_msg,
        "assistant_message": ai_msg
    }