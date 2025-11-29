from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Product, ProductImage, ProductVariant
from .serializers import (
    CategorySerializer, ProductSerializer, 
    ProductImageSerializer, ProductVariantSerializer
)
from .filters import ProductFilter

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images', 'variants')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand', 'category__name']
    ordering_fields = ['price', 'created_at', 'name', 'rating']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Handle category filtering
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Handle price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def similar(self, request, slug=None):
        product = self.get_object()
        similar_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]
        serializer = self.get_serializer(similar_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(
            on_sale=True
        )[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        
        products = self.get_queryset().filter(name__icontains=query)[:5]
        suggestions = [{'name': product.name, 'slug': product.slug} for product in products]
        return Response(suggestions)

class ProductImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.AllowAny]

class ProductVariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductVariant.objects.filter(is_active=True)
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'size', 'color']