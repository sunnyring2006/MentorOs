import os
from dotenv import load_dotenv
from google import genai

def get_ai_recommendation(tasks, profile=None):
    # Reload environment variables to catch dynamic updates
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or api_key.strip() == "" or api_key.startswith("AQ.Ab") or "YOUR_GEMINI" in api_key.upper():
        return "⚠️ **Gemini API Key is missing or invalid.** Please configure your Google Gemini API Key in Settings."

    # Build context about user
    profile_info = ""
    if profile:
        profile_info = f"""
USER PROFILE CONTEXT:
- Name: {profile.name}
- Goal/Role: {profile.role} (Overall focus: {profile.goals_summary})
- Daily Routine: Wakes up at {profile.wake_time}, sleeps at {profile.sleep_time}. Core busy hours (school/work): {profile.busy_hours}.
"""

    try:
        # Initialize client with current API key
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an advanced AI personal productivity mentor for a student/developer.
{profile_info}

Below is the list of tasks for today:
{tasks}

Please analyze these tasks and generate a structured, highly encouraging, and optimized daily schedule.
Requirements:
1. Provide a "📌 Recommended Order" or schedule with estimated time slots (e.g. 9:00 AM - 11:00 AM) for tasks. Respect their daily routine (wake time, sleep time, busy hours) if provided.
2. Order them so that mentally demanding or pending tasks are done first (when energy is highest).
3. Provide a brief "Reason:" or actionable advice on why this order works best.
4. Keep the format clean, using markdown bullets and clear headers. Avoid overly long explanations.
5. If there are no tasks, encourage them to add some tasks to get started.

Response:
"""
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"❌ **Unable to generate recommendation due to an API issue:** {str(e)}\n\nPlease ensure your Google Gemini API Key is valid and active."


def get_ai_chat_response(user_message, history_messages, profile=None):
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or api_key.strip() == "" or api_key.startswith("AQ.Ab") or "YOUR_GEMINI" in api_key.upper():
        return "⚠️ **Gemini API Key is missing or invalid.** Please configure your Google Gemini API Key in Settings."

    profile_info = ""
    if profile:
        profile_info = f"""
You are chatting with {profile.name}, who is a {profile.role}.
Their main goal: {profile.goals_summary}
Daily Routine: Wake: {profile.wake_time}, Sleep: {profile.sleep_time}, Busy hours: {profile.busy_hours}.
"""

    system_instruction = f"""
You are MentorOS, a supportive, elite AI personal productivity mentor.
{profile_info}
Always give extremely actionable, encouraging, and clear guidance. Avoid verbose fluff. Be concise and friendly.
"""

    chat_history_str = ""
    for msg in history_messages:
        role_label = "Kimaya" if msg.sender == "user" else "Mentor"
        chat_history_str += f"{role_label}: {msg.text}\n"

    prompt = f"""
{system_instruction}

Conversation history:
{chat_history_str}
Kimaya: {user_message}
Mentor:
"""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"❌ **Error interacting with Gemini:** {str(e)}"
