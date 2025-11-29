from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.utils.formats import number_format
from .models import PaymentMethod, Payment, Refund, Transaction, MpesaTransaction, MpesaCallback

# --- Inlines ---
class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = ('type', 'amount', 'currency', 'success', 'created_at')
    can_delete = False
    max_num = 10

    def has_add_permission(self, request, obj):
        return False


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ('amount', 'reason', 'status', 'created_at')
    can_delete = False
    max_num = 5

    def has_add_permission(self, request, obj):
        return False


class MpesaCallbackInline(admin.TabularInline):
    model = MpesaCallback
    extra = 0
    readonly_fields = ('callback_data_preview', 'received_at')
    can_delete = False
    max_num = 5

    def callback_data_preview(self, obj):
        import json
        return format_html(
            '<pre style="max-height: 100px; overflow: auto; font-size: 10px;">{}</pre>',
            json.dumps(obj.callback_data, indent=2)
        )
    callback_data_preview.short_description = 'Callback Data'


# --- PaymentMethod Admin ---
@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = (
        'user_email',
        'type_display',
        'card_display',
        'is_default',
        'created_at'
    )
    list_filter = ('type', 'is_default', 'created_at')
    search_fields = ('user__email', 'user__username', 'card_last4', 'card_brand')
    readonly_fields = ('created_at', 'updated_at', 'card_display_full')
    list_per_page = 20

    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('Payment Method Details', {'fields': ('type', 'is_default', 'card_display_full')}),
        ('Card Information (Encrypted)', {
            'fields': ('card_last4', 'card_brand', 'card_exp_month', 'card_exp_year'),
            'classes': ('collapse',)
        }),
        ('Payment Provider Data', {
            'fields': ('provider_customer_id', 'provider_payment_method_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def type_display(self, obj):
        type_icons = {
            'card': '💳', 'paypal': '🔵', 'bank_transfer': '🏦', 'wallet': '📱'
        }
        return format_html('{} {}', type_icons.get(obj.type, '📄'), obj.get_type_display())
    type_display.short_description = 'Type'

    def card_display(self, obj):
        if obj.type == 'card' and obj.card_last4:
            return format_html('{} **** **** **** {}', obj.card_brand or 'Card', obj.card_last4)
        return obj.get_type_display()
    card_display.short_description = 'Details'

    def card_display_full(self, obj):
        if obj.type == 'card' and obj.card_last4:
            return format_html(
                '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
                '<strong>{} Card</strong><br>'
                '**** **** **** {}<br>'
                'Expires: {}/{}'
                '</div>',
                obj.card_brand or 'Credit',
                obj.card_last4,
                obj.card_exp_month,
                obj.card_exp_year
            )
        return "Not a card payment method"
    card_display_full.short_description = 'Card Details'


# --- Payment Admin ---
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'truncated_id', 'order_number', 'user_email', 'amount_display',
        'status_badge', 'payment_method_display', 'created_at', 'processed_at_display'
    )
    list_filter = ('status', 'currency', 'created_at', 'processed_at')
    search_fields = ('order__order_number', 'user__email', 'provider_payment_id', 'id')
    readonly_fields = ('created_at', 'updated_at', 'processed_at', 'payment_timeline', 'amount_display_full')
    list_per_page = 25
    inlines = [TransactionInline, RefundInline]

    fieldsets = (
        ('Basic Information', {'fields': ('order', 'user', 'payment_method')}),
        ('Payment Details', {'fields': ('amount_display_full', 'currency', 'status')}),
        ('Provider Information', {'fields': ('provider_payment_id', 'provider_client_secret'), 'classes': ('collapse',)}),
        ('Error Handling', {'fields': ('error_code', 'error_message'), 'classes': ('collapse',)}),
        ('Timeline', {'fields': ('payment_timeline', 'created_at', 'updated_at', 'processed_at')}),
    )

    actions = ['mark_as_completed', 'mark_as_failed', 'retry_payments']

    # --- Display methods ---
    def truncated_id(self, obj):
        return str(obj.id)[:8] + '...'
    truncated_id.short_description = 'Payment ID'

    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order'

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'

    def amount_display(self, obj):
        currency_symbols = {'USD': '$','KES': 'KSh','EUR': '€','GBP': '£'}
        symbol = currency_symbols.get(obj.currency, obj.currency)
        formatted_amount = number_format(obj.amount, 2)
        return format_html('<strong>{}{}</strong>', symbol, formatted_amount)
    amount_display.short_description = 'Amount'

    def amount_display_full(self, obj):
        currency_symbols = {'USD': '$','KES': 'KSh','EUR': '€','GBP': '£'}
        symbol = currency_symbols.get(obj.currency, obj.currency)
        formatted_amount = number_format(obj.amount, 2)
        return format_html('<h3>{}{} {}</h3>', symbol, formatted_amount, obj.currency)
    amount_display_full.short_description = 'Amount'

    def status_badge(self, obj):
        status_colors = {
            'pending': 'blue', 'processing': 'orange', 'completed': 'green',
            'failed': 'red', 'cancelled': 'gray', 'refunded': 'purple', 'partially_refunded': 'violet'
        }
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; '
            'border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'

    def payment_method_display(self, obj):
        return obj.payment_method.get_type_display() if obj.payment_method else "Not specified"
    payment_method_display.short_description = 'Method'

    def processed_at_display(self, obj):
        return obj.processed_at.strftime('%Y-%m-%d %H:%M') if obj.processed_at else "Not processed"
    processed_at_display.short_description = 'Processed'

    def payment_timeline(self, obj):
        timeline = [f"Created: {obj.created_at.strftime('%Y-%m-%d %H:%M:%S')}"]
        if obj.processed_at:
            timeline.append(f"Processed: {obj.processed_at.strftime('%Y-%m-%d %H:%M:%S')}")
            duration = (obj.processed_at - obj.created_at).total_seconds()
            timeline.append(f"Duration: {number_format(duration, 1)} seconds")
        if obj.updated_at and obj.updated_at != obj.created_at:
            timeline.append(f"Updated: {obj.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")
        return format_html('<br>'.join(timeline))
    payment_timeline.short_description = 'Payment Timeline'

    # --- Actions ---
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed', processed_at=timezone.now())
        self.message_user(request, f'{updated} payment(s) were marked as completed.')
    mark_as_completed.short_description = "Mark selected payments as completed"

    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated} payment(s) were marked as failed.')
    mark_as_failed.short_description = "Mark selected payments as failed"

    def retry_payments(self, request, queryset):
        payments_to_retry = queryset.filter(status__in=['failed', 'pending'])
        updated = payments_to_retry.count()
        self.message_user(request, f'{updated} payment(s) queued for retry (mock action).')
    retry_payments.short_description = "Retry selected payments"


# --- Refund Admin ---
@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('truncated_id', 'payment_display', 'amount_display', 'status_badge', 'provider_refund_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('payment__id', 'provider_refund_id', 'id')
    readonly_fields = ('created_at', 'updated_at', 'refund_details')
    list_per_page = 20

    fieldsets = (
        ('Refund Information', {'fields': ('payment', 'refund_details')}),
        ('Refund Details', {'fields': ('amount', 'reason', 'status')}),
        ('Provider Data', {'fields': ('provider_refund_id',), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def truncated_id(self, obj):
        return str(obj.id)[:8] + '...'
    truncated_id.short_description = 'Refund ID'

    def payment_display(self, obj):
        return format_html(
            '{}<br><small>Order: {}</small>',
            str(obj.payment.id)[:8] + '...',
            obj.payment.order.order_number
        )
    payment_display.short_description = 'Payment'

    def amount_display(self, obj):
        currency_symbols = {'USD': '$','KES': 'KSh','EUR': '€','GBP': '£'}
        symbol = currency_symbols.get(obj.payment.currency, obj.payment.currency)
        formatted_amount = number_format(obj.amount, 2)
        return format_html('<strong>{}{}</strong>', symbol, formatted_amount)
    amount_display.short_description = 'Amount'

    def status_badge(self, obj):
        status_colors = {'pending': 'blue','processing': 'orange','completed': 'green','failed': 'red','cancelled': 'gray'}
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'

    def refund_details(self, obj):
        currency_symbols = {'USD': '$','KES': 'KSh','EUR': '€','GBP': '£'}
        symbol = currency_symbols.get(obj.payment.currency, '')
        payment_amount = number_format(obj.payment.amount, 2)
        refund_amount = number_format(obj.amount, 2)
        refund_percent = number_format((obj.amount / obj.payment.amount) * 100, 1)
        return format_html(
            '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
            '<strong>Original Payment:</strong> {}<br>'
            '<strong>Payment Amount:</strong> {}{}<br>'
            '<strong>Refund Amount:</strong> {}{}<br>'
            '<strong>Refund Percentage:</strong> {}%'
            '</div>',
            str(obj.payment.id),
            symbol, payment_amount,
            symbol, refund_amount,
            refund_percent
        )
    refund_details.short_description = 'Refund Summary'


# --- Transaction Admin ---
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('truncated_id','payment_display','type_badge','amount_display','success_badge','created_at')
    list_filter = ('type','success','currency','created_at')
    search_fields = ('payment__id','provider_transaction_id','id')
    readonly_fields = ('created_at','transaction_details')
    list_per_page = 30

    def truncated_id(self, obj):
        return str(obj.id)[:8] + '...'
    truncated_id.short_description = 'Transaction ID'

    def payment_display(self, obj):
        return format_html(
            '{}<br><small>Order: {}</small>',
            str(obj.payment.id)[:8] + '...',
            obj.payment.order.order_number
        )
    payment_display.short_description = 'Payment'

    def type_badge(self, obj):
        type_colors = {'payment': 'green','refund': 'blue','authorization': 'orange','capture': 'teal','void': 'red'}
        color = type_colors.get(obj.type, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color,
            obj.get_type_display().upper()
        )
    type_badge.short_description = 'Type'

    def amount_display(self, obj):
        currency_symbols = {'USD': '$','KES': 'KSh','EUR': '€','GBP': '£'}
        symbol = currency_symbols.get(obj.currency, obj.currency)
        formatted_amount = number_format(obj.amount, 2)
        return format_html('<strong>{}{}</strong>', symbol, formatted_amount)
    amount_display.short_description = 'Amount'

    def success_badge(self, obj):
        color = 'green' if obj.success else 'red'
        text = 'SUCCESS' if obj.success else 'FAILED'
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, text
        )
    success_badge.short_description = 'Success'

    def transaction_details(self, obj):
        formatted_amount = number_format(obj.amount, 2)
        details = [
            f"Transaction ID: {obj.id}",
            f"Type: {obj.get_type_display()}",
            f"Amount: {obj.currency} {formatted_amount}",
            f"Success: {obj.success}",
            f"Created: {obj.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
        ]
        if obj.provider_transaction_id:
            details.append(f"Provider TXN ID: {obj.provider_transaction_id}")
        if obj.error_message:
            details.append(f"Error: {obj.error_message}")
        return format_html('<br>'.join(details))
    transaction_details.short_description = 'Transaction Details'


# --- MpesaTransaction Admin ---
@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ('truncated_id','payment_display','phone_number','amount_display','status_badge','transaction_id','created_at')
    list_filter = ('status','created_at')
    search_fields = ('phone_number','transaction_id','merchant_request_id','checkout_request_id','payment__order__order_number')
    readonly_fields = ('created_at','updated_at','completed_at','mpesa_details','result_info')
    list_per_page = 20
    inlines = [MpesaCallbackInline]

    fieldsets = (
        ('Transaction Information', {'fields': ('payment', 'mpesa_details')}),
        ('M-Pesa Details', {'fields': ('phone_number','amount','status')}),
        ('M-Pesa Response Data', {'fields': ('transaction_id','merchant_request_id','checkout_request_id','result_info'),'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at','updated_at','completed_at')}),
    )

    actions = ['check_mpesa_status']

    def truncated_id(self, obj):
        return str(obj.id)[:8] + '...'
    truncated_id.short_description = 'M-Pesa ID'

    def payment_display(self, obj):
        return format_html(
            '{}<br><small>Order: {}</small>',
            str(obj.payment.id)[:8] + '...',
            obj.payment.order.order_number
        )
    payment_display.short_description = 'Payment'

    def amount_display(self, obj):
        formatted_amount = number_format(obj.amount, 2)
        return format_html('<strong>KSh{}</strong>', formatted_amount)
    amount_display.short_description = 'Amount'

    def status_badge(self, obj):
        status_colors = {'requested': 'blue','pending': 'orange','successful': 'green','failed': 'red','cancelled': 'gray'}
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'

    def mpesa_details(self, obj):
        formatted_amount = number_format(obj.amount, 2)
        details = [
            f"Phone: {obj.phone_number}",
            f"Amount: KSh {formatted_amount}",
            f"Status: {obj.get_status_display()}",
            f"Merchant Request ID: {obj.merchant_request_id or 'N/A'}",
            f"Checkout Request ID: {obj.checkout_request_id or 'N/A'}"
        ]
        if obj.transaction_id:
            details.append(f"M-Pesa Transaction ID: {obj.transaction_id}")
        return format_html('<br>'.join(details))
    mpesa_details.short_description = 'M-Pesa Transaction Details'

    def result_info(self, obj):
        if obj.result_code is not None:
            return format_html(
                '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
                '<strong>Result Code:</strong> {}<br>'
                '<strong>Result Description:</strong> {}'
                '</div>',
                obj.result_code,
                obj.result_description
            )
        return "No result data available"
    result_info.short_description = 'M-Pesa Result'

    def check_mpesa_status(self, request, queryset):
        transactions_to_check = queryset.filter(status__in=['requested', 'pending'])
        updated = transactions_to_check.count()
        self.message_user(request, f'{updated} M-Pesa transaction(s) status check queued (mock action).')
    check_mpesa_status.short_description = "Check M-Pesa transaction status"


# --- MpesaCallback Admin ---
@admin.register(MpesaCallback)
class MpesaCallbackAdmin(admin.ModelAdmin):
    list_display = ('transaction_display','received_at','callback_data_preview')
    list_filter = ('received_at',)
    search_fields = ('transaction__phone_number','transaction__checkout_request_id','transaction__merchant_request_id')
    readonly_fields = ('received_at','callback_data_formatted')
    list_per_page = 20

    def transaction_display(self, obj):
        return format_html(
            '{}<br><small>Phone: {}</small>',
            str(obj.transaction.id)[:8] + '...',
            obj.transaction.phone_number
        )
    transaction_display.short_description = 'M-Pesa Transaction'

    def callback_data_preview(self, obj):
        import json
        preview = json.dumps(obj.callback_data)[:100] + '...' if len(json.dumps(obj.callback_data)) > 100 else json.dumps(obj.callback_data)
        return format_html('<code style="font-size: 10px;">{}</code>', preview)
    callback_data_preview.short_description = 'Callback Data (Preview)'

    def callback_data_formatted(self, obj):
        import json
        return format_html(
            '<pre style="max-height: 500px; overflow: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">{}</pre>',
            json.dumps(obj.callback_data, indent=2)
        )
    callback_data_formatted.short_description = 'Callback Data (Formatted)'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
