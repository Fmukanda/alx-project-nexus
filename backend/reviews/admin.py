from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'product', 
        'user_email', 
        'rating', 
        'title', 
        'is_approved', 
        'created_at', 
        'review_preview'
    )
    
    list_filter = (
        'is_approved', 
        'rating', 
        'created_at', 
        'product'
    )
    
    search_fields = (
        'product__name',
        'user__email',
        'user__username',
        'title',
        'comment'
    )
    
    readonly_fields = (
        'created_at',
        'user_email_display',
        'product_name_display'
    )
    
    list_editable = ('is_approved',)
    
    list_per_page = 20
    
    actions = ['approve_reviews', 'reject_reviews']
    
    fieldsets = (
        ('Review Information', {
            'fields': (
                'product_name_display',
                'user_email_display',
                'rating',
                'title',
                'comment'
            )
        }),
        ('Status & Metadata', {
            'fields': (
                'is_approved',
                'created_at'
            )
        }),
    )
    
    def user_email_display(self, obj):
        return obj.user.email
    user_email_display.short_description = 'User Email'
    
    def product_name_display(self, obj):
        return obj.product.name
    product_name_display.short_description = 'Product Name'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def review_preview(self, obj):
        """Display a preview of the review comment"""
        if len(obj.comment) > 50:
            return f"{obj.comment[:50]}..."
        return obj.comment
    review_preview.short_description = 'Comment Preview'
    
    def approve_reviews(self, request, queryset):
        """Admin action to approve selected reviews"""
        updated = queryset.update(is_approved=True)
        self.message_user(
            request, 
            f'{updated} review(s) were successfully approved.'
        )
    approve_reviews.short_description = "Approve selected reviews"
    
    def reject_reviews(self, request, queryset):
        """Admin action to reject selected reviews"""
        updated = queryset.update(is_approved=False)
        self.message_user(
            request, 
            f'{updated} review(s) were successfully rejected.'
        )
    reject_reviews.short_description = "Reject selected reviews"
    
    def get_queryset(self, request):
        """Optimize database queries by selecting related objects"""
        return super().get_queryset(request).select_related('user', 'product')
    
    def has_delete_permission(self, request, obj=None):
        """Allow only superusers to delete reviews"""
        return request.user.is_superuser
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields read-only for non-superusers"""
        if not request.user.is_superuser:
            return self.readonly_fields + ('rating', 'title', 'comment')
        return self.readonly_fields

class ReviewInline(admin.TabularInline):
    """Inline display for reviews in Product admin"""
    model = Review
    extra = 0
    readonly_fields = ('user', 'rating', 'title', 'comment', 'created_at')
    can_delete = False
    max_num = 5
    
    def has_add_permission(self, request, obj):
        return False
