import logging
from datetime import datetime, timedelta
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone

logger = logging.getLogger(__name__)

class CacheKeys:
    PRODUCT_CATEGORIES = 'product_categories'
    FEATURED_PRODUCTS = 'featured_products'
    USER_SESSION = 'user_session_{}'
    SEARCH_SUGGESTIONS = 'search_suggestions_{}'

def cache_result(key, timeout=300):
    """Decorator to cache function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            cache_key = f"{key}_{str(args)}_{str(kwargs)}"
            result = cache.get(cache_key)
            
            if result is None:
                result = func(*args, **kwargs)
                cache.set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator

def format_currency(amount, currency='USD'):
    """Format currency based on the currency code"""
    if currency == 'KES':
        return f"KSh {amount:,.2f}"
    elif currency == 'EUR':
        return f"€{amount:,.2f}"
    else:  # USD
        return f"${amount:,.2f}"

def generate_order_number():
    """Generate unique order number"""
    from datetime import datetime
    import random
    import string
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_str}"

def calculate_discount_percentage(original_price, sale_price):
    """Calculate discount percentage"""
    if not original_price or not sale_price:
        return 0
    return round(((original_price - sale_price) / original_price) * 100)

def validate_phone_number(phone_number):
    """Validate and format phone number for M-Pesa"""
    import re
    
    # Remove any non-digit characters
    cleaned = re.sub(r'\D', '', phone_number)
    
    # Convert to 254 format
    if cleaned.startswith('0') and len(cleaned) == 10:
        return '254' + cleaned[1:]
    elif cleaned.startswith('7') and len(cleaned) == 9:
        return '254' + cleaned
    elif cleaned.startswith('254') and len(cleaned) == 12:
        return cleaned
    else:
        raise ValueError("Invalid phone number format")

def send_email_notification(recipient, subject, template, context):
    """Send email notification (mock implementation)"""
    # In production, integrate with email service like SendGrid, Mailgun, etc.
    logger.info(f"Email sent to {recipient}: {subject}")
    return True

def send_sms_notification(phone_number, message):
    """Send SMS notification (mock implementation)"""
    # In production, integrate with SMS service like Twilio, Africa's Talking, etc.
    logger.info(f"SMS sent to {phone_number}: {message}")
    return True

class PerformanceTimer:
    """Context manager for performance timing"""
    
    def __init__(self, operation_name):
        self.operation_name = operation_name
        self.start_time = None
    
    def __enter__(self):
        self.start_time = timezone.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        end_time = timezone.now()
        duration = (end_time - self.start_time).total_seconds()
        logger.info(f"{self.operation_name} completed in {duration:.2f}s")
