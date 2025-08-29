from rest_framework import permissions


class IsStaff(permissions.IsAuthenticated):
    """
    Custom permission to only allow staff members to access certain views.
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'staff'


class IsManager(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'manager'


class IsOrderOwner(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of an order to view or edit it.
    """

    def has_object_permission(self, request, view, order):
        return super().has_permission(request, view) and request.user == order.user


class IsOwnerLoyaltyPoint(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of loyalty points to view or edit it.
    """

    def has_object_permission(self, request, view, loyalty_point):
        return super().has_permission(request, view) and request.user == loyalty_point.user


class IsOwnerLoyaltyPointHistory(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of loyalty point history to view or edit it.
    """

    def has_object_permission(self, request, view, loyalty_point_history):
        return super().has_permission(request, view) and request.user == loyalty_point_history.user


class IsReviewOwner(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of a review to view or edit it.
    """

    def has_object_permission(self, request, view, review):
        return super().has_permission(request, view) and request.user == review.user


class IsReviewOwner(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of a review to view or edit it.
    """

    def has_object_permission(self, request, view, review):
        return super().has_permission(request, view) and request.user == review.user


class IsCustomer(permissions.IsAuthenticated):
    """
    Custom permission to only allow users with the 'customer' role to access certain views.
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'customer'


class IsOwnerCart(permissions.IsAuthenticated):
    """
    Custom permission to only allow owners of a cart to view or edit it.
    """

    def has_object_permission(self, request, view, cart):
        return super().has_permission(request, view) and request.user == cart.user


class IsManagerOrStaff(permissions.IsAuthenticated):
    """
    Custom permission to only allow users with the 'manager' or 'staff' role to access certain views.
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['manager', 'staff']