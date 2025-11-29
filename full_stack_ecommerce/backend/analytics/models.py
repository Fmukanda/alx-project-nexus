from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product, Category

User = get_user_model()

class PageView(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    page_url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['product', 'timestamp']),
        ]

class ProductClick(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=100)
    source_page = models.URLField()

class CartActivity(models.Model):
    ACTION_CHOICES = [
        ('add', 'Add to Cart'),
        ('remove', 'Remove from Cart'),
        ('update', 'Update Quantity'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    quantity = models.PositiveIntegerField(default=1)
    timestamp = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=100)

class OrderAnalytics(models.Model):
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE)
    acquisition_channel = models.CharField(max_length=50, blank=True)
    marketing_campaign = models.CharField(max_length=100, blank=True)
    customer_lifetime_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    days_to_first_purchase = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = 'Order Analytics'