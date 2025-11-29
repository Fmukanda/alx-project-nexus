from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer, OrderItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_status']
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(user=self.request.user).prefetch_related('items')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        
        # Create order items from cart data
        cart_items = self.request.data.get('items', [])
        for item_data in cart_items:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'],
                variant_id=item_data.get('variant'),
                quantity=item_data['quantity'],
                price=item_data['price']
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            
            # Restore stock if needed
            for item in order.items.all():
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                    item.variant.save()
            
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Order cannot be cancelled in its current status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can update order status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Order.ORDER_STATUS):
            order.status = new_status
            order.save()
            return Response({'status': f'Order status updated to {new_status}'})
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )