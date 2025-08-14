from cloudinary.provisioning import users
from oauthlib.uri_validate import query
from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import permission_classes, action
from rest_framework.response import Response

from store import serializers, paginators
from store.models import Category, Supplier, Product, Review, User


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = serializers.ProductSerializer
    pagination_class = paginators.ProductPagination

    def get_queryset(self):
        query = self.queryset

        if self.action.__eq__("list"):
            params = self.request.query_params.get("kw")
            if params:
                query = query.filter(name__icontains=params)

            category_id = self.request.query_params.get("category_id")
            if category_id:
                query = query.filter(category_id=category_id)

            brand_id = self.request.query_params.get("brand_id")
            if brand_id:
                query = query.filter(brand_id=brand_id)

            price_min = self.request.query_params.get("price_min")
            if price_min:
                query = query.filter(price__gte=price_min)

            price_max = self.request.query_params.get("price_max")
            if price_max:
                query = query.filter(price__lte=price_max)

        return query


class UserViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    @action(methods=["get", "patch"], detail=False, url_path="current-user",
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__("PATCH"):
            for key, value in request.data.items():
                if key.__eq__('password'):
                    user.set_password(value)
                else:
                    setattr(user, key, value)

            user.save()

        return Response(serializers.UserSerializer(request.user).data)


class SupplierViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Supplier.objects.all()
    serializer_class = serializers.SupplierSerializer


class ReviewViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = serializers.ReviewSerializer
