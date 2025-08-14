from rest_framework import permissions


class IsStaff(permissions.IsAuthenticated):
    """
    Custom permission to only allow staff members to access certain views.
    """
    def has_object_permission(self, request, view, obj):
        return super().has_permission(request, view) and request.user == obj.staff

class IsOrderOwner(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of an order to view or edit it.
    """
    def has_object_permission(self, request, view, order):
        return super().has_permission(request, view) and request.user == order.user


class IsReviewOwner(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of a review to view or edit it.
    """
    def has_object_permission(self, request, view, review):
        return super().has_permission(request, view) and request.user == review.user
