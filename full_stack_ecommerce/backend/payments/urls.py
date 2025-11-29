from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('payment-methods', views.PaymentMethodViewSet, basename='payment-method')
router.register('payments', views.PaymentViewSet, basename='payment')
router.register('refunds', views.RefundViewSet, basename='refund')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/', views.WebhookView.as_view(), name='payment-webhook'),
    # M-Pesa endpoints
    path('mpesa/initiate/', views.MpesaPaymentView.as_view(), name='mpesa-initiate'),
    path('mpesa/callback/', views.MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('mpesa/transactions/<uuid:transaction_id>/status/', views.MpesaTransactionStatusView.as_view(), name='mpesa-status'),
    path('mpesa/payment-methods/', views.MpesaPaymentMethodsView.as_view(), name='mpesa-payment-methods'),
]