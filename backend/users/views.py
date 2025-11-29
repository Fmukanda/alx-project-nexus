from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .serializers import (
    UserSerializer, UserProfileSerializer, 
    UserRegistrationSerializer, LoginSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update', 'me']:
            return UserProfileSerializer
        return UserSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Override create to use registration serializer
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """
        Get or update current user profile
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(
                request.user, 
                data=request.data, 
                partial=partial
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user statistics (for admin or the user themselves)
        """
        user = request.user
        
        # Basic stats available to all users
        stats = {
            'user_since': user.date_joined,
            'email_verified': user.email_verified,
        }
        
        # Add admin-only stats
        if user.is_staff:
            stats.update({
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
                'staff_users': User.objects.filter(is_staff=True).count(),
            })
            
        # Add user-specific stats if related models exist
        try:
            stats['orders_count'] = user.orders.count()
        except:
            stats['orders_count'] = 0
            
        try:
            stats['reviews_count'] = user.review_set.count()
        except:
            stats['reviews_count'] = 0
            
        return Response(stats)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def activate(self, request, pk=None):
        """
        Activate/deactivate user (admin only)
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        action = "activated" if user.is_active else "deactivated"
        return Response({
            'message': f'User {action} successfully',
            'is_active': user.is_active
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify_email(self, request, pk=None):
        """
        Verify user email (admin only)
        """
        user = self.get_object()
        user.email_verified = True
        user.save()
        
        return Response({
            'message': 'Email verified successfully',
            'email_verified': user.email_verified
        })

class AuthViewSet(viewsets.ViewSet):
    """
    Authentication ViewSet
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        User registration
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        User login
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        })

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        User logout
        """
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Successfully logged out'}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': 'Invalid token'},  
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def password_reset(self, request):
        """
        Request password reset
        """
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email, is_active=True).first()
        
        if user:
            # Generate token
            token = default_token_generator.make_token(user)
            
            # In production, you would send an email here
            # For now, we'll return the token in the response (remove in production)
            reset_link = f"{getattr(settings, 'FRONTEND_URL', '')}/password-reset/confirm/?uid={user.id}&token={token}"
            
            return Response({
                'message': 'Password reset email sent',
                'reset_token': token,  # Remove this in production
                'user_id': user.id,
                'reset_link': reset_link
            })
        
        # Always return success to prevent email enumeration
        return Response({
            'message': 'If the email exists, a password reset link has been sent'
        })

    @action(detail=False, methods=['post'])
    def password_reset_confirm(self, request):
        """
        Confirm password reset with token
        """
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password has been reset successfully'
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        Change password for authenticated user
        """
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        new_password = serializer.validated_data['new_password']
        
        user.set_password(new_password)
        user.save()
        
        # Generate new tokens since password changed
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Password changed successfully',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify_email(self, request):
        """
        Verify user email (mock implementation - in real app, use email confirmation)
        """
        user = request.user
        user.email_verified = True
        user.save()
        
        return Response({
            'message': 'Email verified successfully',
            'email_verified': user.email_verified
        })