from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'phone', 'address', 'date_of_birth', 'email_verified',
            'is_staff', 'is_active', 'date_joined'
        ]
        read_only_fields = [
            'id', 'email_verified', 'is_staff', 'is_active', 
            'date_joined'
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'phone', 'address', 'date_of_birth', 'email_verified'
        ]
        read_only_fields = ['id', 'email', 'email_verified']

    def validate_username(self, value):
        """
        Check that the username is unique excluding the current user
        """
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 
            'password', 'password_confirm'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return attrs

    def validate_email(self, value):
        """
        Check that the email is unique
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_username(self, value):
        """
        Check that the username is unique
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Since we're using email as USERNAME_FIELD, we can use authenticate
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # Using email as username
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
                
            if not user.is_active:
                raise serializers.ValidationError('Account is disabled')
                
        else:
            raise serializers.ValidationError('Must include email and password')

        attrs['user'] = user
        return attrs

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Check if email exists in the system
        """
        if not User.objects.filter(email=value, is_active=True).exists():
            # We still return success to prevent email enumeration
            # But we don't raise validation error
            pass
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(
        min_length=8,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(min_length=8)

    def validate(self, attrs):
        # Check password confirmation
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords don't match"})

        try:
            # Get user by ID
            user_id = attrs['uid']
            user = User.objects.get(id=user_id, is_active=True)
            
            # Verify token
            if not default_token_generator.check_token(user, attrs['token']):
                raise serializers.ValidationError({"token": "Invalid or expired token"})
            
            attrs['user'] = user
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid user"})

        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(
        min_length=8,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords don't match"})
        return attrs