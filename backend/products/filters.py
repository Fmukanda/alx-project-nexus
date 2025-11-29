import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = django_filters.CharFilter(field_name="category__slug")
    brand = django_filters.CharFilter(field_name="brand", lookup_expr='icontains')
    on_sale = django_filters.BooleanFilter(field_name="on_sale")
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    size = django_filters.CharFilter(method='filter_by_size')
    color = django_filters.CharFilter(method='filter_by_color')
    
    class Meta:
        model = Product
        fields = ['category', 'gender', 'brand', 'on_sale']
    
    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(variants__stock_quantity__gt=0).distinct()
        return queryset
    
    def filter_by_size(self, queryset, name, value):
        if value:
            sizes = value.split(',')
            return queryset.filter(variants__size__in=sizes).distinct()
        return queryset
    
    def filter_by_color(self, queryset, name, value):
        if value:
            colors = value.split(',')
            return queryset.filter(variants__color__in=colors).distinct()
        return queryset