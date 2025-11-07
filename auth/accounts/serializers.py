from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    """
    A serializer for registering a new user.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        # Make the password "write-only" - it won't be sent back in the response
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # This automatically hashes the password.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user