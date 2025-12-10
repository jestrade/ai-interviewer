from google import genai
from google.genai.errors import APIError
from django.conf import settings

def generate_ai_response(user_prompt: str, model_name: str = 'gemini-2.5-flash'):
    """Generates a response using the Gemini API."""
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt
        )
        return response.text
    except APIError as e:
        return f"Error connecting to Gemini API: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"