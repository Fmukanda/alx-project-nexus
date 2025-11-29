from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta

class OrderStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    today = serializers.IntegerField()
    this_week = serializers.IntegerField()
    pending = serializers.IntegerField()

class RevenueStatsSerializer(serializers.Serializer):
    total = serializers.FloatField()
    this_week = serializers.FloatField()
    today = serializers.FloatField()

class ProductStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()

class CustomerStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    new_this_week = serializers.IntegerField()

class DashboardStatsSerializer(serializers.Serializer):
    orders = OrderStatsSerializer()
    revenue = RevenueStatsSerializer()
    products = ProductStatsSerializer()
    customers = CustomerStatsSerializer()

class DailySalesSerializer(serializers.Serializer):
    date = serializers.DateField()
    revenue = serializers.FloatField()
    orders = serializers.IntegerField()

class TopProductSerializer(serializers.Serializer):
    product__name = serializers.CharField(source='product_name')
    total_sold = serializers.IntegerField(default=0)
    total_revenue = serializers.FloatField(default=0)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Rename fields for better frontend consumption
        data['name'] = data.pop('product_name')
        data['revenue'] = data.pop('total_revenue')
        data['units_sold'] = data.pop('total_sold')
        return data

class SalesOverviewSerializer(serializers.Serializer):
    daily_sales = DailySalesSerializer(many=True)
    top_products = TopProductSerializer(many=True)

class ProductPerformanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    total_sold = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    avg_rating = serializers.FloatField()
    review_count = serializers.IntegerField()
    stock_status = serializers.CharField()

class AcquisitionChannelSerializer(serializers.Serializer):
    channel = serializers.CharField()
    customers = serializers.IntegerField()
    percentage = serializers.FloatField()

class CustomerBehaviorSerializer(serializers.Serializer):
    acquisition_channels = AcquisitionChannelSerializer(many=True)
    customer_lifetime_value = serializers.FloatField()
    repeat_customer_rate = serializers.FloatField()
    total_customers = serializers.IntegerField()
    repeat_customers = serializers.IntegerField()

# Additional serializers for more detailed analytics

class OrderTrendSerializer(serializers.Serializer):
    period = serializers.CharField()
    orders = serializers.IntegerField()
    revenue = serializers.FloatField()
    average_order_value = serializers.FloatField()

class CustomerAcquisitionSerializer(serializers.Serializer):
    date = serializers.DateField()
    new_customers = serializers.IntegerField()
    returning_customers = serializers.IntegerField()
    total_customers = serializers.IntegerField()

class InventoryAlertSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    variant_details = serializers.CharField(required=False, allow_null=True)
    current_stock = serializers.IntegerField()
    alert_level = serializers.CharField()  # 'low', 'out', 'critical'
    last_restocked = serializers.DateTimeField(required=False, allow_null=True)

class GeographicSalesSerializer(serializers.Serializer):
    country = serializers.CharField()
    state = serializers.CharField(required=False, allow_null=True)
    city = serializers.CharField(required=False, allow_null=True)
    total_orders = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    average_order_value = serializers.FloatField()

class PaymentMethodAnalyticsSerializer(serializers.Serializer):
    payment_method = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    success_rate = serializers.FloatField()
    average_transaction_value = serializers.FloatField()

class TimeRangeSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    period = serializers.ChoiceField(
        choices=['today', 'week', 'month', 'quarter', 'year', 'custom'],
        default='week'
    )

    def validate(self, data):
        if data.get('period') == 'custom':
            if not data.get('start_date') or not data.get('end_date'):
                raise serializers.ValidationError(
                    "start_date and end_date are required for custom period"
                )
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError(
                    "start_date cannot be after end_date"
                )
        return data

    def to_internal_value(self, data):
        # Set default dates based on period if not provided
        data = super().to_internal_value(data)
        today = timezone.now().date()
        
        if data.get('period') == 'today':
            data['start_date'] = today
            data['end_date'] = today
        elif data.get('period') == 'week':
            data['start_date'] = today - timedelta(days=7)
            data['end_date'] = today
        elif data.get('period') == 'month':
            data['start_date'] = today - timedelta(days=30)
            data['end_date'] = today
        elif data.get('period') == 'quarter':
            data['start_date'] = today - timedelta(days=90)
            data['end_date'] = today
        elif data.get('period') == 'year':
            data['start_date'] = today - timedelta(days=365)
            data['end_date'] = today
        
        return data

# Response serializers for the existing views

class DashboardStatsResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    data = DashboardStatsSerializer()
    timestamp = serializers.DateTimeField(default=timezone.now)

class SalesOverviewResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    data = SalesOverviewSerializer()
    timestamp = serializers.DateTimeField(default=timezone.now)

class ProductPerformanceResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    data = serializers.DictField(child=ProductPerformanceSerializer(many=True))
    timestamp = serializers.DateTimeField(default=timezone.now)

class CustomerBehaviorResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    data = CustomerBehaviorSerializer()
    timestamp = serializers.DateTimeField(default=timezone.now)

# Add to existing serializers in analytics/serializers.py

class AnalyticsStatsSerializer(serializers.Serializer):
    total_page_views = serializers.IntegerField()
    week_page_views = serializers.IntegerField()
    total_product_clicks = serializers.IntegerField()

class EngagementMetricsSerializer(serializers.Serializer):
    page_views = serializers.IntegerField()
    product_clicks = serializers.IntegerField()
    cart_activities = serializers.IntegerField()

class DailyEngagementSerializer(serializers.Serializer):
    date = serializers.DateField()
    views = serializers.IntegerField()

class PopularProductSerializer(serializers.Serializer):
    product__name = serializers.CharField(source='product_name')
    click_count = serializers.IntegerField()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['name'] = data.pop('product_name')
        data['clicks'] = data.pop('click_count')
        return data

class ConversionMetricsSerializer(serializers.Serializer):
    cart_adds = serializers.IntegerField()
    purchases = serializers.IntegerField()
    conversion_rate = serializers.FloatField()

# Update the DashboardStatsSerializer to include analytics
class DashboardStatsSerializer(serializers.Serializer):
    orders = OrderStatsSerializer()
    revenue = RevenueStatsSerializer()
    products = ProductStatsSerializer()
    customers = CustomerStatsSerializer()
    analytics = AnalyticsStatsSerializer()  # Add this line

# Update the CustomerBehaviorSerializer to include engagement
class CustomerBehaviorSerializer(serializers.Serializer):
    acquisition_channels = AcquisitionChannelSerializer(many=True)
    customer_lifetime_value = serializers.FloatField()
    repeat_customer_rate = serializers.FloatField()
    total_customers = serializers.IntegerField()
    repeat_customers = serializers.IntegerField()
    engagement_metrics = EngagementMetricsSerializer() 