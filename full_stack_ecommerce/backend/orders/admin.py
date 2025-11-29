from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.utils.formats import number_format
from .models import Order, OrderItem

# ----- Inline Order Items -----
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        'product_image_preview',
        'product_name',
        'variant_details',
        'quantity',
        'price_display',
        'total_price_display'
    )
    fields = readonly_fields
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def variant_details(self, obj):
        if obj.variant:
            return f"{obj.variant.size} - {obj.variant.color}"
        return "No variant"
    variant_details.short_description = 'Variant'

    def price_display(self, obj):
        return f"${number_format(obj.price, 2)}"
    price_display.short_description = 'Unit Price'

    def total_price_display(self, obj):
        return f"${number_format(obj.total_price, 2)}"
    total_price_display.short_description = 'Total'

    def product_image_preview(self, obj):
        if obj.product.images.exists():
            primary_image = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                primary_image.image.url
            )
        return "No Image"
    product_image_preview.short_description = 'Image'

# ----- Order Admin -----
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'user_email',
        'status_badge',
        'payment_status_badge',
        'total_display',
        'item_count',
        'created_at',
        'quick_actions'
    )
    list_filter = ('status', 'payment_status', 'created_at', 'payment_method', 'shipping_country')
    search_fields = ('order_number', 'user__email', 'user__username', 'shipping_first_name', 'shipping_last_name')
    readonly_fields = (
        'order_number', 'created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at',
        'order_summary', 'customer_info', 'shipping_info', 'payment_info', 'timeline'
    )
    list_per_page = 25
    inlines = [OrderItemInline]

    # ----- Optimized queryset -----
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related(
            'items', 'items__variant', 'items__product', 'items__product__images'
        )

    # ----- Display Methods -----
    def user_email(self, obj):
        return format_html(
            '{}<br><small>{}</small>',
            obj.user.email,
            f"{obj.user.first_name} {obj.user.last_name}".strip() or 'No name'
        )
    user_email.short_description = 'Customer'

    def status_badge(self, obj):
        status_colors = {
            'pending': 'gray', 'confirmed': 'blue', 'processing': 'orange',
            'shipped': 'purple', 'delivered': 'green', 'cancelled': 'red', 'refunded': 'violet'
        }
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'

    def payment_status_badge(self, obj):
        status_colors = {
            'pending': 'gray', 'paid': 'green', 'failed': 'red',
            'refunded': 'violet', 'partially_refunded': 'orange'
        }
        color = status_colors.get(obj.payment_status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color,
            obj.get_payment_status_display().upper()
        )
    payment_status_badge.short_description = 'Payment'

    def total_display(self, obj):
        return format_html('<strong style="font-size: 14px;">${}</strong>', number_format(obj.total, 2))
    total_display.short_description = 'Total'

    def item_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="background: #e9ecef; color: #495057; padding: 2px 8px; border-radius: 10px; font-size: 12px;">{} items</span>',
            count
        )
    item_count.short_description = 'Items'

    # ----- Quick Actions Column (Text-only) -----
    def quick_actions(self, obj):
        return format_html("Check order detail to update status")  # placeholder
    quick_actions.short_description = 'Quick Actions'

    # ----- Summary Sections -----
    def order_summary(self, obj):
        items_html = [
            f"• {item.quantity} × {item.product.name} ({item.variant.size if item.variant else 'No variant'}) - ${number_format(item.total_price, 2)}"
            for item in obj.items.all()
        ]
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">'
            '<h4 style="margin-top: 0; color: #495057;">Order Summary</h4>'
            '<div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">{}<br>'
            '<strong>Total Items: {}</strong><br>'
            '<strong>Order Total: ${}</strong>'
            '</div>'
            '</div>',
            '<br>'.join(items_html) if items_html else 'No items',
            obj.items.count(),
            number_format(obj.total, 2)
        )
    order_summary.short_description = 'Order Summary'

    def customer_info(self, obj):
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">'
            '<strong>Customer:</strong> {} ({})<br>'
            '<strong>Email:</strong> {}<br>'
            '<strong>Phone:</strong> {}'
            '</div>',
            f"{obj.user.first_name} {obj.user.last_name}".strip() or 'No name',
            obj.user.username,
            obj.user.email,
            getattr(obj.user, 'phone', 'Not provided')
        )
    customer_info.short_description = 'Customer Information'

    def shipping_info(self, obj):
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">'
            '<strong>Recipient:</strong> {} {}<br>'
            '<strong>Address:</strong> {}<br>'
            '<strong>City:</strong> {}, {} {}<br>'
            '<strong>Country:</strong> {}<br>'
            '<strong>Phone:</strong> {}'
            '</div>',
            obj.shipping_first_name,
            obj.shipping_last_name,
            obj.shipping_address,
            obj.shipping_city,
            obj.shipping_state,
            obj.shipping_zip_code,
            obj.shipping_country,
            obj.shipping_phone or 'Not provided'
        )
    shipping_info.short_description = 'Shipping Information'

    def payment_info(self, obj):
        payment_details = [
            f"<strong>Method:</strong> {obj.payment_method}",
            f"<strong>Status:</strong> {obj.get_payment_status_display()}",
            f"<strong>Transaction ID:</strong> {obj.payment_transaction_id or 'Not available'}"
        ]
        if obj.paid_at:
            payment_details.append(f"<strong>Paid at:</strong> {obj.paid_at.strftime('%Y-%m-%d %H:%M')}")
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">{}</div>',
            '<br>'.join(payment_details)
        )
    payment_info.short_description = 'Payment Information'

    def timeline(self, obj):
        events = [f"📅 Created: {obj.created_at.strftime('%Y-%m-%d %H:%M')}"]
        if obj.paid_at:
            events.append(f"💳 Paid: {obj.paid_at.strftime('%Y-%m-%d %H:%M')}")
        if obj.shipped_at:
            events.append(f"🚚 Shipped: {obj.shipped_at.strftime('%Y-%m-%d %H:%M')}")
        if obj.delivered_at:
            events.append(f"✅ Delivered: {obj.delivered_at.strftime('%Y-%m-%d %H:%M')}")
        if obj.updated_at and obj.updated_at != obj.created_at:
            events.append(f"📝 Updated: {obj.updated_at.strftime('%Y-%m-%d %H:%M')}")
        return format_html('<br>'.join(events))
    timeline.short_description = 'Order Timeline'

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

# ----- OrderItem Admin -----
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'product_name', 'variant_display', 'quantity', 'price_display_full', 'total_price_display_full', 'order_status')
    readonly_fields = ('order_number_display', 'product_details', 'price_display_full', 'total_price_display_full')
    list_per_page = 30
    search_fields = ('order__order_number', 'product__name', 'variant__color', 'variant__size')
    list_filter = ('order__status', 'order__created_at', 'product__category')

    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order'

    def order_number_display(self, obj):
        return format_html(
            '<strong>{}</strong><br><small>Status: {}</small><br><small>Customer: {}</small>',
            obj.order.order_number,
            obj.order.get_status_display(),
            obj.order.user.email
        )
    order_number_display.short_description = 'Order Details'

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def variant_display(self, obj):
        if obj.variant:
            return format_html('{}<br><small>{}</small>', obj.variant.size, obj.variant.color)
        return "No variant"
    variant_display.short_description = 'Variant'

    def price_display_full(self, obj):
        return f"${number_format(obj.price, 2)} per unit"
    price_display_full.short_description = 'Unit Price'

    def total_price_display_full(self, obj):
        return format_html('<strong style="color:#28a745;">${}</strong>', number_format(obj.total_price, 2))
    total_price_display_full.short_description = 'Line Total'

    def order_status(self, obj):
        status_colors = {
            'pending': 'gray', 'confirmed': 'blue', 'processing': 'orange',
            'shipped': 'purple', 'delivered': 'green', 'cancelled': 'red', 'refunded': 'violet'
        }
        color = status_colors.get(obj.order.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px;">{}</span>',
            color,
            obj.order.get_status_display().upper()
        )
    order_status.short_description = 'Order Status'

    def product_details(self, obj):
        image_html = ""
        if obj.product.images.exists():
            primary_image = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            image_html = format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px; margin-right: 10px;" />',
                primary_image.image.url
            )
        variant_text = f"{obj.variant.size} - {obj.variant.color}" if obj.variant else "No variant"
        return format_html(
            '<div style="display:flex; align-items:center;">{}<div><strong>{}</strong><br>'
            '<small>Category: {}</small><br>'
            '<small>Brand: {}</small><br>'
            '<small>Variant: {}</small></div></div>',
            image_html, obj.product.name, obj.product.category.name, obj.product.brand, variant_text
        )
    product_details.short_description = 'Product Information'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

# ----- Admin Branding -----
admin.site.site_header = "Ecommerce Orders Administration"
admin.site.site_title = "Ecommerce Orders Admin"
admin.site.index_title = "Order Management Dashboard"

