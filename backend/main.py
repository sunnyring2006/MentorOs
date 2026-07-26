from fastapi import FastAPI
from gemini_service import get_ai_recommendation

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MentorOS Backend Running 🚀"}

@app.get("/recommend")
def recommend():
    try:
        tasks = """
        Solve 2 DSA Problems
        Work on MentorOS
        Workout
        """

        recommendation = get_ai_recommendation(tasks)

        return {
            "recommendation": recommendation
        }

    except Exception as e:
        return {
            "error": str(e)
        }