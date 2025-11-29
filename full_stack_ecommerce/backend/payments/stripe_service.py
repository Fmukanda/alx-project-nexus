import stripe
import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

class StripeService:
    def __init__(self):
        self.api_key = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_mock_key')
        self.webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', 'whsec_mock_secret')
        stripe.api_key = self.api_key
    
    def create_customer(self, user, payment_method_id=None):
        """Create a Stripe customer"""
        try:
            customer_data = {
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}",
                'metadata': {
                    'user_id': str(user.id),
                    'username': user.username
                }
            }
            
            if payment_method_id:
                customer_data['payment_method'] = payment_method_id
                customer_data['invoice_settings'] = {
                    'default_payment_method': payment_method_id
                }
            
            customer = stripe.Customer.create(**customer_data)
            return customer
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation failed: {str(e)}")
            raise
    
    def create_payment_intent(self, amount, currency='usd', customer_id=None, payment_method_id=None):
        """Create a payment intent"""
        try:
            intent_data = {
                'amount': int(amount * 100),  # Convert to cents
                'currency': currency,
                'payment_method_types': ['card'],
                'metadata': {
                    'created_at': timezone.now().isoformat()
                }
            }
            
            if customer_id:
                intent_data['customer'] = customer_id
            
            if payment_method_id:
                intent_data['payment_method'] = payment_method_id
                intent_data['confirm'] = True
                intent_data['return_url'] = f"{getattr(settings, 'FRONTEND_URL', '')}/checkout/success"
            
            payment_intent = stripe.PaymentIntent.create(**intent_data)
            return payment_intent
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {str(e)}")
            raise
    
    def confirm_payment_intent(self, payment_intent_id, payment_method_id=None):
        """Confirm a payment intent"""
        try:
            intent_data = {}
            
            if payment_method_id:
                intent_data['payment_method'] = payment_method_id
            
            payment_intent = stripe.PaymentIntent.confirm(
                payment_intent_id,
                **intent_data
            )
            return payment_intent
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent confirmation failed: {str(e)}")
            raise
    
    def create_refund(self, payment_intent_id, amount=None):
        """Create a refund"""
        try:
            refund_data = {
                'payment_intent': payment_intent_id,
            }
            
            if amount:
                refund_data['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_data)
            return refund
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund creation failed: {str(e)}")
            raise
    
    def setup_future_payments(self, customer_id, payment_method_id):
        """Setup payment method for future use"""
        try:
            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id,
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                customer_id,
                invoice_settings={
                    'default_payment_method': payment_method_id
                }
            )
            
            return True
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe future payments setup failed: {str(e)}")
            raise
    
    def handle_webhook(self, payload, signature):
        """Handle Stripe webhook"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            # Handle different event types
            if event['type'] == 'payment_intent.succeeded':
                return self._handle_payment_succeeded(event['data']['object'])
            elif event['type'] == 'payment_intent.payment_failed':
                return self._handle_payment_failed(event['data']['object'])
            elif event['type'] == 'charge.refunded':
                return self._handle_refund_processed(event['data']['object'])
            else:
                logger.info(f"Unhandled Stripe event type: {event['type']}")
                return True
                
        except ValueError as e:
            logger.error(f"Invalid Stripe webhook payload: {str(e)}")
            return False
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid Stripe webhook signature: {str(e)}")
            return False
    
    def _handle_payment_succeeded(self, payment_intent):
        """Handle successful payment"""
        try:
            from .models import Payment
            
            payment = Payment.objects.get(
                provider_payment_id=payment_intent['id']
            )
            payment.status = 'completed'
            payment.processed_at = timezone.now()
            payment.save()
            
            # Update order status
            order = payment.order
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            
            logger.info(f"Payment completed: {payment_intent['id']}")
            return True
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {payment_intent['id']}")
            return False
    
    def _handle_payment_failed(self, payment_intent):
        """Handle failed payment"""
        try:
            from .models import Payment
            
            payment = Payment.objects.get(
                provider_payment_id=payment_intent['id']
            )
            payment.status = 'failed'
            payment.error_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
            payment.save()
            
            logger.warning(f"Payment failed: {payment_intent['id']}")
            return True
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {payment_intent['id']}")
            return False
    
    def _handle_refund_processed(self, charge):
        """Handle refund processed"""
        try:
            from .models import Payment, Refund
            
            payment = Payment.objects.get(
                provider_payment_id=charge['payment_intent']
            )
            
            # Find or create refund record
            refund, created = Refund.objects.get_or_create(
                provider_refund_id=charge['id'],
                defaults={
                    'payment': payment,
                    'amount': charge['amount_refunded'] / 100,
                    'status': 'completed',
                }
            )
            
            if not created:
                refund.status = 'completed'
                refund.save()
            
            # Update payment status
            if charge['amount_refunded'] == charge['amount']:
                payment.status = 'refunded'
            else:
                payment.status = 'partially_refunded'
            payment.save()
            
            logger.info(f"Refund processed: {charge['id']}")
            return True
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for refund: {charge['payment_intent']}")
            return False

# Initialize Stripe service
stripe_service = StripeService()