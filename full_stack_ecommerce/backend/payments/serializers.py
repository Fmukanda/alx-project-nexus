from rest_framework import serializers
from .models import PaymentMethod, Payment, Refund, Transaction, MpesaTransaction
from orders.serializers import OrderSerializer

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'type', 'is_default', 'card_last4', 'card_brand', 
                 'card_exp_month', 'card_exp_year', 'created_at')
        read_only_fields = ('id', 'created_at')

class CreatePaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('type', 'card_last4', 'card_brand', 'card_exp_month', 'card_exp_year')
    
    def validate(self, attrs):
        # In a real implementation, you would validate card details
        # and tokenize with your payment provider
        if attrs['type'] == 'card':
            if not all(k in attrs for k in ['card_last4', 'card_brand', 'card_exp_month', 'card_exp_year']):
                raise serializers.ValidationError("Card details are required for card payments")
        return attrs

class PaymentSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    payment_method_details = PaymentMethodSerializer(source='payment_method', read_only=True)
    
    class Meta:
        model = Payment
        fields = ('id', 'order', 'order_details', 'payment_method', 'payment_method_details',
                 'amount', 'currency', 'status', 'provider_payment_id',
                 'error_code', 'error_message', 'created_at', 'updated_at', 'processed_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'processed_at')

class CreatePaymentSerializer(serializers.ModelSerializer):
    payment_method_id = serializers.UUIDField(write_only=True, required=False)
    save_payment_method = serializers.BooleanField(default=False)
    
    class Meta:
        model = Payment
        fields = ('order', 'payment_method_id', 'save_payment_method')
    
    def validate(self, attrs):
        order = attrs['order']
        user = self.context['request'].user
        
        # Verify order belongs to user
        if order.user != user:
            raise serializers.ValidationError("Order does not belong to user")
        
        # Verify order is in a payable state
        if order.status not in ['pending', 'confirmed']:
            raise serializers.ValidationError("Order cannot be paid in its current status")
        
        # Verify payment method belongs to user if provided
        payment_method_id = attrs.get('payment_method_id')
        if payment_method_id:
            try:
                payment_method = PaymentMethod.objects.get(id=payment_method_id, user=user)
                attrs['payment_method'] = payment_method
            except PaymentMethod.DoesNotExist:
                raise serializers.ValidationError("Invalid payment method")
        
        return attrs

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ('id', 'payment', 'amount', 'reason', 'status', 
                 'provider_refund_id', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'payment', 'type', 'amount', 'currency',
                 'provider_transaction_id', 'success', 'error_message', 'created_at')
        read_only_fields = ('id', 'created_at')

class MpesaTransactionSerializer(serializers.ModelSerializer):
    payment_details = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = MpesaTransaction
        fields = ('id', 'payment', 'payment_details', 'phone_number', 'amount',
                 'transaction_id', 'merchant_request_id', 'checkout_request_id',
                 'result_code', 'result_description', 'status', 'created_at',
                 'updated_at', 'completed_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'completed_at')

class CreateMpesaPaymentSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    order = serializers.UUIDField()
    
    def validate_phone_number(self, value):
        """Validate and format phone number"""
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, value))
        
        # Convert to 254 format if it's in 07... or 7... format
        if cleaned.startswith('0') and len(cleaned) == 10:
            cleaned = '254' + cleaned[1:]
        elif cleaned.startswith('7') and len(cleaned) == 9:
            cleaned = '254' + cleaned
        elif cleaned.startswith('254') and len(cleaned) == 12:
            pass  # Already in correct format
        else:
            raise serializers.ValidationError("Invalid phone number format. Use 07XXX, 7XXX, or 2547XXX")
        
        return cleaned
    
    def validate(self, attrs):
        order_id = attrs['order']
        user = self.context['request'].user
        
        try:
            from orders.models import Order
            order = Order.objects.get(id=order_id, user=user)
            attrs['order'] = order
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found or does not belong to user")
        
        # Verify order is in a payable state
        if order.status not in ['pending', 'confirmed']:
            raise serializers.ValidationError("Order cannot be paid in its current status")
        
        return attrs

class MpesaCallbackSerializer(serializers.Serializer):
    """Serializer for M-Pesa callback data"""
    Body = serializers.DictField()
    
    def validate(self, attrs):
        body = attrs.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        
        if not stk_callback:
            raise serializers.ValidationError("Invalid callback format")
        
        return attrs