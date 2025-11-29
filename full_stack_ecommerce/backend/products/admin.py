from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count
from .models import Category, Product, ProductImage, ProductVariant

# --- Inlines ---
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    readonly_fields = ('stock_status',)
    
    def stock_status(self, obj):
        if obj.stock_quantity == 0:
            return format_html('<span style="color: red;">Out of Stock</span>')
        elif obj.stock_quantity < 10:
            return format_html('<span style="color: orange;">Low Stock ({})</span>', obj.stock_quantity)
        else:
            return format_html('<span style="color: green;">In Stock ({})</span>', obj.stock_quantity)
    stock_status.short_description = 'Stock Status'

# --- Category Admin ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'is_active', 'image_preview')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('image_preview',)
    list_editable = ('is_active',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

# --- Product Admin ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'category', 
        'brand', 
        'price_display', 
        'sale_price_display', 
        'on_sale', 
        'stock_status', 
        'is_active', 
        'created_at'
    )
    
    list_filter = (
        'category', 
        'brand', 
        'gender', 
        'on_sale', 
        'is_active', 
        'created_at'
    )
    
    search_fields = (
        'name', 
        'slug', 
        'brand', 
        'description',
        'category__name'
    )
    
    prepopulated_fields = {'slug': ('name',)}
    
    readonly_fields = (
        'created_at', 
        'updated_at', 
        'profit_margin_display'
    )
    
    list_editable = ('on_sale', 'is_active')
    list_per_page = 25
    inlines = [ProductImageInline, ProductVariantInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 
                'slug', 
                'category', 
                'brand', 
                'gender',
                'description'
            )
        }),
        ('Pricing', {
            'fields': (
                'price', 
                'sale_price', 
                'on_sale',
                'profit_margin_display'
            )
        }),
        ('Product Details', {
            'fields': (
                'material',
                'care_instructions',
            )
        }),       
        ('Status & Metadata', {
            'fields': (
                'is_active',
                'created_at',
                'updated_at'
            )
        }),
    )
    
    actions = [
        'activate_products',
        'deactivate_products',
        'enable_sale',
        'disable_sale'
    ]
    
    # --- Display Methods ---
    def price_display(self, obj):
        if obj.on_sale and obj.sale_price:
            return format_html(
                '<span style="text-decoration: line-through; color: gray;">${}</span><br>'
                '<span style="color: red; font-weight: bold;">${}</span>',
                obj.price, obj.sale_price
            )
        return format_html('<span>${}</span>', obj.price)
    price_display.short_description = 'Price'
    
    def sale_price_display(self, obj):
        return f"${obj.sale_price}" if obj.sale_price else "-"
    sale_price_display.short_description = 'Sale Price'
    
    def stock_status(self, obj):
        total_stock = sum(variant.stock_quantity for variant in obj.variants.all())
        if total_stock == 0:
            return format_html('<span style="color: red;">● Out of Stock</span>')
        elif total_stock < 10:
            return format_html('<span style="color: orange;">● Low Stock ({})</span>', total_stock)
        else:
            return format_html('<span style="color: green;">● In Stock ({})</span>', total_stock)
    stock_status.short_description = 'Stock'
    
    def profit_margin_display(self, obj):
        if obj.on_sale and obj.sale_price:
            margin = ((obj.price - obj.sale_price) / obj.price) * 100
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                'green' if margin > 0 else 'red',
                margin
            )
        return "No sale"
    profit_margin_display.short_description = 'Discount Margin'
    
    # --- Actions ---
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} product(s) were successfully activated.')
    activate_products.short_description = "Activate selected products"
    
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} product(s) were successfully deactivated.')
    deactivate_products.short_description = "Deactivate selected products"
    
    def enable_sale(self, request, queryset):
        updated = queryset.update(on_sale=True)
        self.message_user(request, f'{updated} product(s) were put on sale.')
    enable_sale.short_description = "Put selected products on sale"
    
    def disable_sale(self, request, queryset):
        updated = queryset.update(on_sale=False)
        self.message_user(request, f'{updated} product(s) were removed from sale.')
    disable_sale.short_description = "Remove selected products from sale"

# --- Product Image Admin ---
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image_preview', 'alt_text', 'is_primary')
    list_filter = ('is_primary', 'product__category')
    search_fields = ('product__name', 'alt_text')
    list_editable = ('is_primary', 'alt_text')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image'

# --- Product Variant Admin ---
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'color', 'sku', 'stock_quantity_display', 'is_active')
    list_filter = ('size', 'color', 'is_active', 'product__category')
    search_fields = ('product__name', 'sku', 'color')
    list_editable = ('is_active',)  # Removed 'stock_quantity'
    readonly_fields = ('low_stock_warning',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('product', 'size', 'color', 'sku')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'low_stock_warning', 'is_active')
        }),
    )
    
    actions = ['activate_variants', 'deactivate_variants']
    
    def stock_quantity_display(self, obj):
        if obj.stock_quantity == 0:
            return format_html('<span style="color: red;">{}</span>', obj.stock_quantity)
        elif obj.stock_quantity < 10:
            return format_html('<span style="color: orange;">{}</span>', obj.stock_quantity)
        else:
            return format_html('<span style="color: green;">{}</span>', obj.stock_quantity)
    stock_quantity_display.short_description = 'Stock'
    
    def low_stock_warning(self, obj):
        if obj.stock_quantity == 0:
            return format_html('<strong style="color: red;">OUT OF STOCK - Restock needed!</strong>')
        elif obj.stock_quantity < 10:
            return format_html('<strong style="color: orange;">LOW STOCK - Consider restocking</strong>')
        return format_html('<span style="color: green;">Adequate stock level</span>')
    low_stock_warning.short_description = 'Stock Alert'
    
    def activate_variants(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} variant(s) were successfully activated.')
    activate_variants.short_description = "Activate selected variants"
    
    def deactivate_variants(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} variant(s) were successfully deactivated.')
    deactivate_variants.short_description = "Deactivate selected variants"

# --- Custom Admin Titles ---
admin.site.site_header = "Ecommerce Administration"
admin.site.site_title = "Ecommerce Admin Portal"
admin.site.index_title = "Welcome to Ecommerce Administration"
