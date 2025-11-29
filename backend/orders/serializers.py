from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer, ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 
                 'variant', 'variant_details', 'quantity', 'price', 'total_price')
        read_only_fields = ('id', 'total_price')
    
    def get_product_image(self, obj):
        if obj.product.images.exists():
            return obj.product.images.first().image.url
        return None
    
    def get_variant_details(self, obj):
        if obj.variant:
            return f"{obj.variant.size} - {obj.variant.color}"
        return None
    
    @property
    def total_price(self):
        return self.quantity * self.price

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ('id', 'order_number', 'user', 'user_email', 'user_full_name',
                 'status', 'payment_status', 'shipping_first_name', 
                 'shipping_last_name', 'shipping_address', 'shipping_city',
                 'shipping_state', 'shipping_zip_code', 'shipping_country',
                 'shipping_phone', 'payment_method', 'subtotal', 'shipping_cost',
                 'tax_amount', 'total', 'items', 'created_at', 'updated_at',
                 'paid_at', 'shipped_at', 'delivered_at')
        read_only_fields = ('id', 'order_number', 'created_at', 'updated_at',
                          'paid_at', 'shipped_at', 'delivered_at')
    
    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class CreateOrderSerializer(serializers.ModelSerializer):
    items = serializers.JSONField(write_only=True)
    
    class Meta:
        model = Order
        fields = (
            'shipping_first_name', 'shipping_last_name', 'shipping_address',
            'shipping_city', 'shipping_state', 'shipping_zip_code',
            'shipping_country', 'shipping_phone', 'payment_method', 'items'
        )
    
    def validate_items(self, value):
        if not value or not isinstance(value, list):
            raise serializers.ValidationError("Items must be a non-empty list")
        
        for item in value:
            if not all(k in item for k in ['product', 'quantity', 'price']):
                raise serializers.ValidationError("Each item must have product, quantity, and price")
            
            # Check stock availability
            variant_id = item.get('variant')
            if variant_id:
                from products.models import ProductVariant
                try:
                    variant = ProductVariant.objects.get(id=variant_id)
                    if variant.stock_quantity < item['quantity']:
                        raise serializers.ValidationError(
                            f"Insufficient stock for variant {variant_id}"
                        )
                except ProductVariant.DoesNotExist:
                    raise serializers.ValidationError(f"Variant {variant_id} does not exist")
        
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'],
                variant_id=item_data.get('variant'),
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            
            # Update stock if variant exists
            variant_id = item_data.get('variant')
            if variant_id:
                from products.models import ProductVariant
                variant = ProductVariant.objects.get(id=variant_id)
                variant.stock_quantity -= item_data['quantity']
                variant.save()
        
        return order