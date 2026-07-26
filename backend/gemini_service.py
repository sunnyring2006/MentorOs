import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def get_ai_recommendation(tasks):
    prompt = f"""
You are MentorOS AI.

Today's tasks:
{tasks}

Suggest:
1. Best order to complete the tasks.
2. Why.
3. Best timings.

Keep the answer short and practical.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text