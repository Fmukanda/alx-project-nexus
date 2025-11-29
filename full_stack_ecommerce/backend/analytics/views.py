from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
from orders.models import Order, OrderItem
from products.models import Product
from users.models import User
from .models import PageView, ProductClick, CartActivity  # Import from analytics models
from .serializers import (
    DashboardStatsResponseSerializer, 
    SalesOverviewResponseSerializer,
    ProductPerformanceResponseSerializer,
    CustomerBehaviorResponseSerializer,
    TimeRangeSerializer
)

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Time ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Order statistics
        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        week_orders = Order.objects.filter(created_at__date__gte=week_ago).count()
        pending_orders = Order.objects.filter(status='pending').count()
        
        # Revenue statistics
        total_revenue = Order.objects.aggregate(
            total=Sum('total')
        )['total'] or 0
        
        week_revenue = Order.objects.filter(
            created_at__date__gte=week_ago
        ).aggregate(
            total=Sum('total')
        )['total'] or 0
        
        today_revenue = Order.objects.filter(
            created_at__date=today
        ).aggregate(
            total=Sum('total')
        )['total'] or 0
        
        # Product statistics
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(
            variants__stock_quantity__lte=10
        ).distinct().count()
        out_of_stock_products = Product.objects.filter(
            variants__stock_quantity=0
        ).distinct().count()
        
        # Customer statistics
        total_customers = User.objects.filter(is_staff=False).count()
        new_customers_week = User.objects.filter(
            date_joined__date__gte=week_ago,
            is_staff=False
        ).count()
        
        # Analytics statistics
        total_page_views = PageView.objects.count()
        week_page_views = PageView.objects.filter(timestamp__date__gte=week_ago).count()
        total_product_clicks = ProductClick.objects.count()
        
        data = {
            'orders': {
                'total': total_orders,
                'today': today_orders,
                'this_week': week_orders,
                'pending': pending_orders,
            },
            'revenue': {
                'total': float(total_revenue),
                'this_week': float(week_revenue),
                'today': float(today_revenue),
            },
            'products': {
                'total': total_products,
                'low_stock': low_stock_products,
                'out_of_stock': out_of_stock_products,
            },
            'customers': {
                'total': total_customers,
                'new_this_week': new_customers_week,
            },
            'analytics': {
                'total_page_views': total_page_views,
                'week_page_views': week_page_views,
                'total_product_clicks': total_product_clicks,
            }
        }
        
        serializer = DashboardStatsResponseSerializer({
            'data': data
        })
        return Response(serializer.data)

class SalesOverviewView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Time range validation
        time_serializer = TimeRangeSerializer(data=request.query_params)
        time_serializer.is_valid(raise_exception=True)
        time_data = time_serializer.validated_data
        
        start_date = time_data['start_date']
        end_date = time_data['end_date']
        
        # Daily sales data
        daily_sales = []
        current_date = start_date
        
        while current_date <= end_date:
            day_sales = Order.objects.filter(
                created_at__date=current_date
            ).aggregate(
                total=Sum('total'),
                count=Count('id')
            )
            
            daily_sales.append({
                'date': current_date,
                'revenue': float(day_sales['total'] or 0),
                'orders': day_sales['count'] or 0,
            })
            
            current_date += timedelta(days=1)
        
        # Top selling products
        top_products = OrderItem.objects.filter(
            order__created_at__date__gte=start_date,
            order__created_at__date__lte=end_date
        ).values(
            'product__name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('price')
        ).order_by('-total_sold')[:10]
        
        data = {
            'daily_sales': daily_sales,
            'top_products': top_products
        }
        
        serializer = SalesOverviewResponseSerializer({
            'data': data
        })
        return Response(serializer.data)

class ProductPerformanceView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Time range validation
        time_serializer = TimeRangeSerializer(data=request.query_params)
        time_serializer.is_valid(raise_exception=True)
        time_data = time_serializer.validated_data
        
        start_date = time_data['start_date']
        end_date = time_data['end_date']
        
        # Product performance metrics
        products = Product.objects.filter(
            orderitem__order__created_at__date__gte=start_date,
            orderitem__order__created_at__date__lte=end_date
        ).annotate(
            total_sold=Sum('orderitem__quantity'),
            total_revenue=Sum('orderitem__price'),
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).filter(total_sold__isnull=False).order_by('-total_sold')[:20]
        
        product_data = []
        for product in products:
            product_data.append({
                'id': product.id,
                'name': product.name,
                'total_sold': product.total_sold or 0,
                'total_revenue': float(product.total_revenue or 0),
                'avg_rating': float(product.avg_rating or 0),
                'review_count': product.review_count or 0,
                'stock_status': 'In Stock' if product.variants.filter(stock_quantity__gt=0).exists() else 'Out of Stock'
            })
        
        serializer = ProductPerformanceResponseSerializer({
            'data': {'products': product_data}
        })
        return Response(serializer.data)

class CustomerBehaviorView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Time range validation
        time_serializer = TimeRangeSerializer(data=request.query_params)
        time_serializer.is_valid(raise_exception=True)
        time_data = time_serializer.validated_data
        
        start_date = time_data['start_date']
        end_date = time_data['end_date']
        
        # Customer acquisition channels (mock data - in real app, track this)
        acquisition_data = [
            {'channel': 'Organic Search', 'customers': 45, 'percentage': 35},
            {'channel': 'Social Media', 'customers': 30, 'percentage': 23},
            {'channel': 'Email Marketing', 'customers': 25, 'percentage': 19},
            {'channel': 'Direct', 'customers': 20, 'percentage': 15},
            {'channel': 'Referral', 'customers': 10, 'percentage': 8},
        ]
        
        # Customer lifetime value
        customer_lifetime_value = User.objects.filter(
            is_staff=False,
            orders__isnull=False,
            orders__created_at__date__gte=start_date,
            orders__created_at__date__lte=end_date
        ).annotate(
            total_spent=Sum('orders__total'),
            order_count=Count('orders')
        ).aggregate(
            avg_lifetime_value=Avg('total_spent')
        )
        
        # Repeat customer rate
        total_customers = User.objects.filter(
            is_staff=False,
            orders__created_at__date__gte=start_date,
            orders__created_at__date__lte=end_date
        ).distinct().count()
        
        repeat_customers = User.objects.filter(
            is_staff=False,
            orders__created_at__date__gte=start_date,
            orders__created_at__date__lte=end_date
        ).annotate(
            order_count=Count('orders')
        ).filter(order_count__gte=2).distinct().count()
        
        repeat_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
        
        # Customer engagement metrics
        total_page_views = PageView.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).count()
        
        total_product_clicks = ProductClick.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).count()
        
        cart_activities = CartActivity.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).count()
        
        data = {
            'acquisition_channels': acquisition_data,
            'customer_lifetime_value': float(customer_lifetime_value['avg_lifetime_value'] or 0),
            'repeat_customer_rate': round(repeat_rate, 2),
            'total_customers': total_customers,
            'repeat_customers': repeat_customers,
            'engagement_metrics': {
                'page_views': total_page_views,
                'product_clicks': total_product_clicks,
                'cart_activities': cart_activities,
            }
        }
        
        serializer = CustomerBehaviorResponseSerializer({
            'data': data
        })
        return Response(serializer.data)

class EngagementMetricsView(APIView):
    """Additional view for detailed engagement metrics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        time_serializer = TimeRangeSerializer(data=request.query_params)
        time_serializer.is_valid(raise_exception=True)
        time_data = time_serializer.validated_data
        
        start_date = time_data['start_date']
        end_date = time_data['end_date']
        
        # Page views by day
        daily_page_views = []
        current_date = start_date
        
        while current_date <= end_date:
            views_count = PageView.objects.filter(
                timestamp__date=current_date
            ).count()
            
            daily_page_views.append({
                'date': current_date,
                'views': views_count,
            })
            
            current_date += timedelta(days=1)
        
        # Most viewed products
        popular_products = ProductClick.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).values(
            'product__name'
        ).annotate(
            click_count=Count('id')
        ).order_by('-click_count')[:10]
        
        # Cart conversion rate
        cart_adds = CartActivity.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date,
            action='add'
        ).count()
        
        purchases = OrderItem.objects.filter(
            order__created_at__date__gte=start_date,
            order__created_at__date__lte=end_date
        ).count()
        
        conversion_rate = (purchases / cart_adds * 100) if cart_adds > 0 else 0
        
        data = {
            'daily_engagement': daily_page_views,
            'popular_products': list(popular_products),
            'conversion_metrics': {
                'cart_adds': cart_adds,
                'purchases': purchases,
                'conversion_rate': round(conversion_rate, 2)
            }
        }
        
        return Response(data)