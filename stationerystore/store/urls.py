from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("users", views.UserViewSet, basename="user")
router.register('categories', views.CategoryViewSet, basename="category")
router.register('products', views.ProductViewSet, basename="product")
router.register('suppliers', views.SupplierViewSet, basename='supplier')
router.register('reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls))
]
