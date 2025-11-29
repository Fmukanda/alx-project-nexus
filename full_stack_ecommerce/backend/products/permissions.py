from rest_framework import permissions

class IsProductOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a product to edit it.
    Assumes the Product model has a 'vendor' field linking to User.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the product vendor
        # or admin users
        return (request.user.is_staff or 
                (hasattr(obj, 'vendor') and obj.vendor == request.user))

class CanManageProductImages(permissions.BasePermission):
    """
    Permission to check if user can manage product images.
    Allows product owners and admin users.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users can modify images
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Product owners and admins can modify images
        return (request.user.is_staff or 
                (hasattr(obj.product, 'vendor') and 
                 obj.product.vendor == request.user))

class CanManageProductVariants(permissions.BasePermission):
    """
    Permission to check if user can manage product variants.
    Allows product owners and admin users.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users can modify variants
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Product owners and admins can modify variants
        return (request.user.is_staff or 
                (hasattr(obj.product, 'vendor') and 
                 obj.product.vendor == request.user))


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission to allow admins full access, others read-only.
    Useful for categories and other admin-managed content.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_staff

class CanCreateProduct(permissions.BasePermission):
    """
    Permission to check if user can create products.
    Allows vendors and admin users.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is authenticated and has vendor role or is staff
        return (request.user and 
                request.user.is_authenticated and 
                (request.user.is_staff or 
                 getattr(request.user, 'is_vendor', False)))

class CanModifyProductStock(permissions.BasePermission):
    """
    Permission to check if user can modify product stock levels.
    Allows product owners and admin users.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Product owners and admins can modify stock
        return (request.user.is_staff or 
                (hasattr(obj.product, 'vendor') and 
                 obj.product.vendor == request.user))

class ProductAccessPermission(permissions.BasePermission):
    """
    Comprehensive permission class for product access control.
    """
    
    def has_permission(self, request, view):
        # Allow all read-only methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, require authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Create operations require vendor or admin role
        if request.method == 'POST':
            return (request.user.is_staff or 
                    getattr(request.user, 'is_vendor', False))
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # Allow all read-only methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write operations, check specific permissions
        if not request.user.is_authenticated:
            return False
        
        # Admin users have full access
        if request.user.is_staff:
            return True
        
        # Check if user is the product vendor
        if hasattr(obj, 'vendor'):
            return obj.vendor == request.user
        
        # For reviews, check if user is the review owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False