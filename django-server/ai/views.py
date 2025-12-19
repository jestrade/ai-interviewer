from django.shortcuts import render
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .services import generate_ai_response

@csrf_exempt
def agent_api_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')

            if not user_message:
                return JsonResponse({'error': 'No message provided'}, status=400)

            # Call your Gemini service
            ai_response = generate_ai_response(user_message)

            return JsonResponse({'message': ai_response})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # Simple GET response for a basic check
    return JsonResponse({'message': 'Welcome to the Gemini Agent API! Send a POST request with a "message" key.'})