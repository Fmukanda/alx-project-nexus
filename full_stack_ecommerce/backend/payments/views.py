from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import PaymentMethod, Payment, Refund, MpesaTransaction, MpesaCallback
from .serializers import (
    PaymentMethodSerializer, CreatePaymentMethodSerializer,
    PaymentSerializer, CreatePaymentSerializer, RefundSerializer, 
    MpesaTransactionSerializer, CreateMpesaPaymentSerializer, 
    MpesaCallbackSerializer
)
from .services import payment_gateway
from .mpesa_service import mpesa_gateway

class PaymentMethodViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePaymentMethodSerializer
        return PaymentMethodSerializer
    
    def perform_create(self, serializer):
        # Set the current user as the payment method owner
        serializer.save(user=self.request.user)
        
        # If this is the first payment method, set as default
        if not self.get_queryset().filter(is_default=True).exists():
            serializer.instance.is_default = True
            serializer.instance.save()
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        payment_method = self.get_object()
        
        # Remove default from other payment methods
        PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
        
        # Set this as default
        payment_method.is_default = True
        payment_method.save()
        
        return Response({'status': 'Payment method set as default'})

class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related('order', 'payment_method')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePaymentSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                order = serializer.validated_data['order']
                payment_method = serializer.validated_data.get('payment_method')
                save_payment_method = serializer.validated_data.get('save_payment_method', False)
                
                # Create payment
                payment = Payment.objects.create(
                    order=order,
                    user=request.user,
                    payment_method=payment_method,
                    amount=order.total,
                    currency='USD',
                    status='pending'
                )
                
                # Create payment intent with payment gateway
                payment_intent = payment_gateway.create_payment_intent(payment)
                
                # Update payment with provider data
                payment.provider_payment_id = payment_intent['id']
                payment.provider_client_secret = payment_intent.get('client_secret', '')
                payment.save()
                
                # Create transaction record
                from .models import Transaction
                Transaction.objects.create(
                    payment=payment,
                    type='payment',
                    amount=payment.amount,
                    success=True
                )
                
                # If user wants to save payment method and it's a card
                if save_payment_method and payment_method and payment_method.type == 'card':
                    payment_method.is_default = True
                    payment_method.save()
                
                response_serializer = PaymentSerializer(payment)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Payment creation failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response(
                {'error': 'Payment cannot be confirmed in its current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Confirm payment with payment gateway
            payment_intent = payment_gateway.confirm_payment(payment)
            
            # Update payment status based on provider response
            if payment_intent['status'] == 'succeeded':
                payment.status = 'completed'
                payment.processed_at = timezone.now()
                payment.save()
                
                # Update order status
                order = payment.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save()
                
                return Response({'status': 'Payment completed successfully'})
            else:
                payment.status = 'failed'
                payment.error_message = f"Payment failed with status: {payment_intent['status']}"
                payment.save()
                
                return Response(
                    {'error': 'Payment failed', 'status': payment_intent['status']},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            payment.status = 'failed'
            payment.error_message = str(e)
            payment.save()
            
            return Response(
                {'error': f'Payment confirmation failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Payment cannot be cancelled in its current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'cancelled'
        payment.save()
        
        return Response({'status': 'Payment cancelled'})

class RefundViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see refunds for their payments
        return Refund.objects.filter(payment__user=self.request.user)
    
    def get_serializer_class(self):
        return RefundSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                payment = serializer.validated_data['payment']
                amount = serializer.validated_data['amount']
                reason = serializer.validated_data.get('reason', '')
                
                # Verify payment belongs to user
                if payment.user != request.user:
                    return Response(
                        {'error': 'Payment does not belong to user'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Verify payment is completed
                if payment.status != 'completed':
                    return Response(
                        {'error': 'Refund can only be created for completed payments'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verify refund amount is valid
                if amount <= 0 or amount > payment.amount:
                    return Response(
                        {'error': 'Invalid refund amount'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create refund
                refund = Refund.objects.create(
                    payment=payment,
                    amount=amount,
                    reason=reason,
                    status='pending'
                )
                
                # Process refund with payment gateway
                refund_intent = payment_gateway.create_refund(refund)
                
                # Update refund with provider data
                refund.provider_refund_id = refund_intent['id']
                
                if refund_intent['status'] == 'succeeded':
                    refund.status = 'completed'
                    
                    # Update payment status
                    if amount == payment.amount:
                        payment.status = 'refunded'
                    else:
                        payment.status = 'partially_refunded'
                    payment.save()
                
                refund.save()
                
                response_serializer = RefundSerializer(refund)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Refund creation failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class WebhookView(APIView):
    """Handle webhooks from payment provider"""
    permission_classes = []  # No authentication for webhooks
    authentication_classes = []  # No authentication for webhooks
    
    def post(self, request, *args, **kwargs):
        payload = request.body
        signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        try:
            success = payment_gateway.handle_webhook(payload, signature)
            if success:
                return Response({'status': 'Webhook processed'})
            else:
                return Response(
                    {'error': 'Webhook processing failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return Response(
                {'error': 'Webhook processing failed'},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Initiate M-Pesa STK push payment"""
        serializer = CreateMpesaPaymentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                order = serializer.validated_data['order']
                phone_number = serializer.validated_data['phone_number']
                
                # Create payment record
                payment = Payment.objects.create(
                    order=order,
                    user=request.user,
                    amount=order.total,
                    currency='KES',  # M-Pesa uses Kenyan Shillings
                    status='pending'
                )
                
                # Create M-Pesa transaction
                mpesa_transaction = MpesaTransaction.objects.create(
                    payment=payment,
                    phone_number=phone_number,
                    amount=order.total,
                    status='requested'
                )
                
                # Initiate STK push
                result = mpesa_gateway.stk_push(
                    phone_number=phone_number,
                    amount=order.total,
                    account_reference=f"ORDER{order.order_number}",
                    transaction_desc=f"Payment for order {order.order_number}"
                )
                
                if result['success']:
                    # Update transaction with M-Pesa details
                    mpesa_transaction.merchant_request_id = result['merchant_request_id']
                    mpesa_transaction.checkout_request_id = result['checkout_request_id']
                    mpesa_transaction.status = 'pending'
                    mpesa_transaction.save()
                    
                    # Start background task to check payment status (in real implementation)
                    # self.check_payment_status.delay(mpesa_transaction.id)
                    
                    response_data = {
                        'success': True,
                        'message': result['customer_message'],
                        'transaction_id': mpesa_transaction.id,
                        'checkout_request_id': result['checkout_request_id']
                    }
                    
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    # Update transaction with error
                    mpesa_transaction.status = 'failed'
                    mpesa_transaction.result_description = result.get('error_message', 'STK push failed')
                    mpesa_transaction.save()
                    
                    # Update payment status
                    payment.status = 'failed'
                    payment.error_message = result.get('error_message', 'STK push failed')
                    payment.save()
                    
                    return Response(
                        {'error': result.get('error_message', 'STK push failed')},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
        except Exception as e:
            logger.error(f"M-Pesa payment initiation failed: {str(e)}")
            return Response(
                {'error': f'Payment initiation failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackView(APIView):
    """Handle M-Pesa STK push callback"""
    permission_classes = []
    authentication_classes = []
    
    def post(self, request):
        try:
            # Log the callback for debugging
            logger.info(f"M-Pesa callback received: {json.dumps(request.data)}")
            
            # Save callback data
            callback_data = request.data
            MpesaCallback.objects.create(callback_data=callback_data)
            
            # Parse callback data
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            
            if not checkout_request_id:
                return Response({'ResultCode': 1, 'ResultDesc': 'Invalid callback'})
            
            # Find the transaction
            try:
                mpesa_transaction = MpesaTransaction.objects.get(
                    checkout_request_id=checkout_request_id
                )
            except MpesaTransaction.DoesNotExist:
                logger.error(f"M-Pesa transaction not found: {checkout_request_id}")
                return Response({'ResultCode': 1, 'ResultDesc': 'Transaction not found'})
            
            # Update transaction with callback data
            mpesa_transaction.result_code = result_code
            mpesa_transaction.result_description = result_desc
            
            if result_code == 0:
                # Payment successful
                mpesa_transaction.status = 'successful'
                mpesa_transaction.completed_at = timezone.now()
                
                # Extract transaction details from metadata
                if callback_metadata and isinstance(callback_metadata, dict):
                    items = callback_metadata.get('Item', [])
                    for item in items:
                        if item.get('Name') == 'MpesaReceiptNumber':
                            mpesa_transaction.transaction_id = item.get('Value', '')
                        elif item.get('Name') == 'Amount':
                            mpesa_transaction.amount = item.get('Value', mpesa_transaction.amount)
                        elif item.get('Name') == 'PhoneNumber':
                            mpesa_transaction.phone_number = item.get('Value', mpesa_transaction.phone_number)
                
                # Update payment status
                payment = mpesa_transaction.payment
                payment.status = 'completed'
                payment.processed_at = timezone.now()
                payment.save()
                
                # Update order status
                order = payment.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save()
                
                logger.info(f"M-Pesa payment successful: {mpesa_transaction.transaction_id}")
                
            else:
                # Payment failed
                mpesa_transaction.status = 'failed'
                
                # Update payment status
                payment = mpesa_transaction.payment
                payment.status = 'failed'
                payment.error_message = result_desc
                payment.save()
                
                logger.warning(f"M-Pesa payment failed: {result_desc}")
            
            mpesa_transaction.save()
            
            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
            
        except Exception as e:
            logger.error(f"M-Pesa callback processing error: {str(e)}")
            return Response({'ResultCode': 1, 'ResultDesc': 'Processing error'})

class MpesaTransactionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, transaction_id):
        """Get status of M-Pesa transaction"""
        try:
            mpesa_transaction = MpesaTransaction.objects.get(
                id=transaction_id,
                payment__user=request.user
            )
            
            # Optionally query M-Pesa for latest status
            if mpesa_transaction.checkout_request_id and mpesa_transaction.status == 'pending':
                # In production, you might want to query M-Pesa API for current status
                # status_data = mpesa_gateway.query_transaction_status(mpesa_transaction.checkout_request_id)
                pass
            
            serializer = MpesaTransactionSerializer(mpesa_transaction)
            return Response(serializer.data)
            
        except MpesaTransaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class MpesaPaymentMethodsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's saved M-Pesa numbers"""
        # In a real app, you might want to save frequently used M-Pesa numbers
        # For now, return empty list or mock data
        return Response([])