from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Display fields in the list view
    list_display = (
        'email', 'username', 'first_name', 'last_name', 
        'phone', 'is_staff', 'email_verified', 'is_active', 
        'date_joined'
    )
    
    # Filters for the right sidebar
    list_filter = (
        'is_staff', 'is_superuser', 'is_active', 
        'email_verified', 'date_joined'
    )
    
    # Search fields
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    
    # Ordering
    ordering = ('-date_joined',)
    
    # Fieldsets for the edit view
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal info'), {
            'fields': (
                'first_name', 'last_name', 'phone', 
                'address', 'date_of_birth'
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 
                'groups', 'user_permissions'
            ),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        }),
        (_('Verification'), {
            'fields': ('email_verified',)
        }),
    )
    
    # Fieldsets for the add view
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'password1', 'password2',
                'first_name', 'last_name', 'phone'
            ),
        }),
        (_('Additional Info'), {
            'classes': ('collapse',),
            'fields': ('address', 'date_of_birth'),
        }),
    )
    
    # Readonly fields
    readonly_fields = ('date_joined', 'last_login')
    
    # Custom actions
    actions = ['verify_email', 'deactivate_users']
    
    def verify_email(self, request, queryset):
        """Custom action to verify user emails"""
        updated = queryset.update(email_verified=True)
        self.message_user(
            request, 
            f'Successfully verified email for {updated} user(s).'
        )
    verify_email.short_description = "Verify email for selected users"
    
    def deactivate_users(self, request, queryset):
        """Custom action to deactivate users"""
        updated = queryset.update(is_active=False)
        self.message_user(
            request, 
            f'Successfully deactivated {updated} user(s).'
        )
    deactivate_users.short_description = "Deactivate selected users"
    
    # Custom methods for list display
    def get_queryset(self, request):
        """Optimize queryset for admin"""
        return super().get_queryset(request).select_related()
    
    # Display methods for list view
    def get_date_joined_short(self, obj):
        """Display short date format"""
        return obj.date_joined.strftime('%Y-%m-%d')
    get_date_joined_short.short_description = 'Joined'
    get_date_joined_short.admin_order_field = 'date_joined'