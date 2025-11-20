from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True} # Enforce email is required
        }

    def validate_email(self, value):
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.CharField(required=True) 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields.pop('username', None)

    def validate(self, attrs):
        # Map the received 'email' value back to the internal 'username' key
        attrs['username'] = attrs.get('email') 
        
        data = super().validate(attrs)

        first_name = getattr(self.user, 'first_name', '')
        last_name = getattr(self.user, 'last_name', '')

        data['name'] = f"{first_name} {last_name}".strip()
        data['admin'] = self.user.is_staff
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = f"{user.first_name} {user.last_name}"
        token['admin'] = user.is_staff

        return token
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Check if a user with this email exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "No user is registered with this email address."
            )
        return value
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=6) # Add strong password validation here
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_new_password(self, value):
        # can add more complex validation here later (e.g., regex checks)
        if len(value) < 6:
            raise serializers.ValidationError("New password must be at least 6 characters long.")
        return value