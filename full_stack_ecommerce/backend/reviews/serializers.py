from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'product', 'product_name', 'user', 'user_name', 
                 'user_email', 'rating', 'title', 'comment', 'is_approved', 
                 'created_at')
        read_only_fields = ('user', 'created_at', 'is_approved')
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def create(self, validated_data):
        # Check if user already reviewed this product
        user = self.context['request'].user
        product = validated_data['product']
        
        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("You have already reviewed this product")
        
        return super().create(validated_data)