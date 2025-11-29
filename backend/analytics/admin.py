from django.contrib import admin
from django.utils.html import format_html
from django.utils.formats import number_format
from django.utils import timezone
from datetime import timedelta

from .models import PageView, ProductClick, CartActivity, OrderAnalytics
from orders.models import Order, OrderItem
from products.models import Product, Category
from users.models import User

# ---------------------------------------------------------------------
# PAGE VIEW ADMIN
# ---------------------------------------------------------------------
class PageViewAdmin(admin.ModelAdmin):
    list_display = (
        'page_url_display',
        'user_email',
        'product_name',
        'category_name',
        'timestamp',
        'session_display'
    )

    list_filter = ('timestamp', 'product__category', 'product__is_active')
    search_fields = ('page_url', 'user__email', 'user__username', 'product__name', 'category__name')
    readonly_fields = ('timestamp', 'session_key', 'ip_address', 'page_analytics')
    list_per_page = 50

    fieldsets = (
        ('Page Information', {'fields': ('page_url', 'page_analytics')}),
        ('User Information', {'fields': ('user', 'session_key', 'ip_address')}),
        ('Content Information', {'fields': ('product', 'category')}),
        ('Timestamps', {'fields': ('timestamp',)}),
    )

    def page_url_display(self, obj):
        truncated_url = obj.page_url[:50] + '...' if len(obj.page_url) > 50 else obj.page_url
        return format_html('<a href="{}" target="_blank">{}</a>', obj.page_url, truncated_url)
    page_url_display.short_description = 'Page URL'

    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'
    user_email.short_description = 'User'

    def product_name(self, obj):
        return obj.product.name if obj.product else '-'
    product_name.short_description = 'Product'

    def category_name(self, obj):
        return obj.category.name if obj.category else '-'
    category_name.short_description = 'Category'

    def session_display(self, obj):
        return obj.session_key[:10] + '...' if obj.session_key else '-'
    session_display.short_description = 'Session'

    def page_analytics(self, obj):
        total_views = PageView.objects.filter(page_url=obj.page_url).count()
        return format_html(
            '<div style="background:#f8f9fa;padding:10px;border-radius:5px;">'
            '<strong>Total Views for this URL:</strong> {}<br>'
            '<strong>User Type:</strong> {}'
            '</div>',
            total_views,
            'Registered User' if obj.user else 'Anonymous Visitor'
        )
    page_analytics.short_description = 'Analytics'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'product', 'category')


# ---------------------------------------------------------------------
# PRODUCT CLICK ADMIN
# ---------------------------------------------------------------------
@admin.register(ProductClick)
class ProductClickAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'user_email', 'source_page_display', 'timestamp', 'click_analytics')
    list_filter = ('timestamp', 'product__category')
    search_fields = ('product__name', 'user__email', 'source_page')
    readonly_fields = ('timestamp', 'session_key', 'click_analytics')
    list_per_page = 50

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'

    def source_page_display(self, obj):
        truncated_url = obj.source_page[:40] + '...' if len(obj.source_page) > 40 else obj.source_page
        return format_html('<a href="{}" target="_blank">{}</a>', obj.source_page, truncated_url)

    def click_analytics(self, obj):
        total_clicks = ProductClick.objects.filter(product=obj.product).count()
        return format_html(
            '<span style="background:#007bff;color:white;padding:2px 8px;border-radius:10px;font-size:12px;">'
            '{} clicks</span>',
            total_clicks
        )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'product')


# ---------------------------------------------------------------------
# CART ACTIVITY ADMIN
# ---------------------------------------------------------------------
@admin.register(CartActivity)
class CartActivityAdmin(admin.ModelAdmin):
    list_display = (
        'product_name', 'user_email', 'action_badge', 'quantity',
        'timestamp', 'cart_insights'
    )
    list_filter = ('action', 'timestamp', 'product__category')
    search_fields = ('product__name', 'user__email', 'session_key')
    readonly_fields = ('timestamp', 'session_key', 'cart_analytics')
    list_per_page = 50

    def product_name(self, obj):
        return obj.product.name

    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'

    def action_badge(self, obj):
        colors = {'add': 'success', 'remove': 'danger', 'update': 'warning'}
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            colors.get(obj.action, 'secondary'),
            obj.get_action_display().upper()
        )

    def cart_insights(self, obj):
        cart_adds = CartActivity.objects.filter(product=obj.product, action='add').count()
        purchases = OrderItem.objects.filter(product=obj.product).count()
        conversion_rate = (purchases / cart_adds * 100) if cart_adds else 0
        return format_html('<small>Conversion: {}%</small>', number_format(conversion_rate, 1))

    def cart_analytics(self, obj):
        user_activities = CartActivity.objects.filter(
            user=obj.user if obj.user else None,
            session_key=obj.session_key
        ).count()
        return format_html(
            '<div style="background:#f8f9fa;padding:10px;border-radius:5px;">'
            '<strong>User Cart Activities:</strong> {}<br>'
            '<strong>Session:</strong> {}'
            '</div>',
            user_activities,
            obj.session_key
        )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'product')


# ---------------------------------------------------------------------
# ORDER ANALYTICS ADMIN
# ---------------------------------------------------------------------
@admin.register(OrderAnalytics)
class OrderAnalyticsAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'acquisition_channel', 'marketing_campaign',
        'customer_lifetime_value_display', 'days_to_first_purchase', 'analytics_score'
    )
    list_filter = ('acquisition_channel', 'marketing_campaign')
    search_fields = ('order__order_number', 'acquisition_channel', 'marketing_campaign')
    readonly_fields = ('order_details', 'customer_insights', 'analytics_calculations')
    list_per_page = 30

    def order_number(self, obj):
        return obj.order.order_number

    def customer_lifetime_value_display(self, obj):
        return format_html('${}', number_format(obj.customer_lifetime_value, 2))
    customer_lifetime_value_display.short_description = 'Customer Lifetime Value'

    def analytics_score(self, obj):
        score = sum([
            25 if obj.acquisition_channel else 0,
            25 if obj.marketing_campaign else 0,
            25 if obj.customer_lifetime_value > 0 else 0,
            25 if obj.days_to_first_purchase is not None else 0,
        ])
        color = 'success' if score >= 75 else 'warning' if score >= 50 else 'danger'
        return format_html('<span class="badge badge-{}">{}/100</span>', color, score)

    def order_details(self, obj):
        order = obj.order
        return format_html(
            '<div style="background:#f8f9fa;padding:15px;border-radius:5px;">'
            '<strong>Order:</strong> {}<br>'
            '<strong>Customer:</strong> {}<br>'
            '<strong>Total:</strong> ${}<br>'
            '<strong>Status:</strong> {}'
            '</div>',
            order.order_number,
            order.user.email,
            number_format(order.total, 2),
            order.get_status_display()
        )

    def customer_insights(self, obj):
        user = obj.order.user
        total_orders = Order.objects.filter(user=user).count()
        total_spent = Order.objects.filter(user=user).aggregate(total=Sum('total'))['total'] or 0
        avg_order_value = (total_spent / total_orders) if total_orders else 0
        return format_html(
            '<div style="background:#e7f3ff;padding:15px;border-radius:5px;">'
            '<strong>Total Orders:</strong> {}<br>'
            '<strong>Total Spent:</strong> ${}<br>'
            '<strong>Average Order Value:</strong> ${}'
            '</div>',
            total_orders,
            number_format(total_spent, 2),
            number_format(avg_order_value, 2)
        )

    def analytics_calculations(self, obj):
        return format_html(
            'Customer Lifetime Value: ${}<br>'
            'Days to First Purchase: {}<br>'
            'Acquisition Channel: {}<br>'
            'Marketing Campaign: {}',
            number_format(obj.customer_lifetime_value, 2),
            obj.days_to_first_purchase or 'N/A',
            obj.acquisition_channel or 'Unknown',
            obj.marketing_campaign or 'None'
        )


# ---------------------------------------------------------------------
# REGISTER PAGEVIEW
# ---------------------------------------------------------------------
admin.site.register(PageView, PageViewAdmin)

# ---------------------------------------------------------------------
# ADMIN ACTIONS
# ---------------------------------------------------------------------
def export_analytics_data(modeladmin, request, queryset):
    messages.info(request, f"Export functionality would be implemented here. Selected {queryset.count()} items.")
export_analytics_data.short_description = "Export selected analytics data"

def clear_old_analytics_data(modeladmin, request, queryset):
    one_year_ago = timezone.now() - timedelta(days=365)
    deleted_count = queryset.filter(timestamp__lt=one_year_ago).count()
    queryset.filter(timestamp__lt=one_year_ago).delete()
    messages.success(request, f"Deleted {deleted_count} old analytics records.")
clear_old_analytics_data.short_description = "Clear analytics data older than 1 year"

PageViewAdmin.actions = [export_analytics_data, clear_old_analytics_data]
CartActivityAdmin.actions = [export_analytics_data, clear_old_analytics_data]
ProductClickAdmin.actions = [export_analytics_data, clear_old_analytics_data]

# ---------------------------------------------------------------------
# ADMIN HEADER CUSTOMIZATION
# ---------------------------------------------------------------------
admin.site.site_header = "Ecommerce Analytics Administration"
