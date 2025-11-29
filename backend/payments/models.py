from django.db import models
from django.core.validators import MinValueValidator
from orders.models import Order
from users.models import User
import uuid

class PaymentMethod(models.Model):
    TYPE_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
        ('wallet', 'Digital Wallet'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    
    # Card details (encrypted in real implementation)
    card_last4 = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=50, blank=True)
    card_exp_month = models.PositiveIntegerField(null=True, blank=True)
    card_exp_year = models.PositiveIntegerField(null=True, blank=True)
    
    # Payment provider data
    provider_customer_id = models.CharField(max_length=100, blank=True)
    provider_payment_method_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.card_last4}" if self.card_last4 else self.get_type_display()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('partially_refunded', 'Partially Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Provider data
    provider_payment_id = models.CharField(max_length=100, blank=True)
    provider_client_secret = models.CharField(max_length=100, blank=True)
    
    # Error handling
    error_code = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.currency}"

class Refund(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Provider data
    provider_refund_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Refund {self.id} - {self.amount}"

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('refund', 'Refund'),
        ('authorization', 'Authorization'),
        ('capture', 'Capture'),
        ('void', 'Void'),
    ]
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default='USD')
    
    # Provider data
    provider_transaction_id = models.CharField(max_length=100, blank=True)
    provider_data = models.JSONField(default=dict, blank=True)  # Store raw provider response
    
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.amount} {self.currency}"


class MpesaTransaction(models.Model):
    STATUS_CHOICES = [
        ('requested', 'STK Push Requested'),
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='mpesa_transaction')
    phone_number = models.CharField(max_length=15)  # Format: 254712345678
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=50, blank=True)  # M-Pesa transaction ID
    merchant_request_id = models.CharField(max_length=50, blank=True)
    checkout_request_id = models.CharField(max_length=50, blank=True)
    result_code = models.IntegerField(null=True, blank=True)
    result_description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"M-Pesa {self.phone_number} - {self.amount}"

class MpesaCallback(models.Model):
    """Store raw callback data from M-Pesa for debugging and audit"""
    transaction = models.ForeignKey(MpesaTransaction, on_delete=models.CASCADE, related_name='callbacks')
    callback_data = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-received_at']
    
    def __str__(self):
        return f"Callback for {self.transaction}"