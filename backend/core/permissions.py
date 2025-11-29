from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission to allow admins full access, others read-only.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_staff

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsVendorOrReadOnly(permissions.BasePermission):
    """
    Permission to allow vendors to manage their products.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require vendor role
        return request.user and hasattr(request.user, 'is_vendor') and request.user.is_vendor
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the product vendor
        return obj.vendor == request.user