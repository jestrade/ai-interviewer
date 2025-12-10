from django.urls import path
from . import views

urlpatterns = [
    path('ask/', views.agent_api_view, name='agent_ask'),
]