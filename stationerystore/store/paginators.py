from rest_framework.pagination import PageNumberPagination


class ProductPagination(PageNumberPagination):
    page_size = 8


class ReviewPagination(PageNumberPagination):
    page_size = 5


class OrderPagination(PageNumberPagination):
    page_size = 10


class DiscountPagination(PageNumberPagination):
    page_size = 5


class LoyaltyPointHistoryPagination(PageNumberPagination):
    page_size = 10