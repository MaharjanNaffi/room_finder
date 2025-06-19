from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    """
    Allow anyone to read (GET), but only the owner can edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        # Allow all GET/HEAD/OPTIONS requests
        if request.method in SAFE_METHODS:
            return True
        # Otherwise, only allow if user is the owner
        return obj.owner == request.user
