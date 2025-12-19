from google import genai
from google.genai import types
from google.genai.errors import APIError
from django.conf import settings

def generate_ai_response(user_prompt: str, model_name: str = 'gemini-2.5-flash'):
    """Generates a response using the Gemini API."""
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        messages = [
            types.Content(role= "user", parts=[types.Part(text=user_prompt)])
        ]

        response = client.models.generate_content(
            model=model_name,
            contents=messages
        )
        print (f"Prompt tokens: {response.usage_metadata.prompt_token_count}")
        print (f"Response tokens: {response.usage_metadata.candidates_token_count}")
        return response.text
    except APIError as e:
        return f"Error connecting to Gemini API: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"