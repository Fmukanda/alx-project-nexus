from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, AuthViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # JWT Token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]