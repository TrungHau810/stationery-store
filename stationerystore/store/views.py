from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from store import serializers, paginators, perms
from store.models import Category, Supplier, Product, Review, User, Order, Discount, GoodsReceipt, Payment, ProductImage, ReviewImage
from store.utils import vnpay
from store.utils.vnpay import create_vnpay_url, payment_ipn


def home(request):
    return HttpResponse(
        "<h1>Welcome to Stationery Store API</h1><p>Go to <a href='/swagger/'>Swagger Docs</a></p> <p>Go to <a href='/api/'>APIs</a></p> <p>Go to <a href='/admin/'>Admin site</a></p>")


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer

    @action(methods=["get"], detail=True, url_path="categories")
    def get_category_in_category(self, request, pk):
        try:
            category_parent = self.get_object()
            categories = category_parent.category_children.all()
        except Category.DoesNotExist:
            return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializers.CategorySerializer(categories, many=True).data, status=status.HTTP_200_OK)


class ProductImageViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = ProductImage.objects.all()
    serializer_class = serializers.ProductImageSerializer
    lookup_field = "pk"


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

            category_id = self.request.query_params.get("category")
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

    def get_permissions(self):
        if self.action.__eq__("get_views_of_product") and self.request.method.__eq__("POST"):
            return [permissions.IsAuthenticated()]
        return [AllowAny()]

    @action(methods=["get", "post"], detail=True, url_path="reviews")
    def get_views_of_product(self, request, pk):
        if request.method.__eq__("POST"):
            review = serializers.ReviewSerializer(data={
                "content": request.data.get("content"),
                "product": pk,
                "user": request.user.id
            })
            review.is_valid(raise_exception=True)
            data = review.save()
            return Response(serializers.ReviewSerializer(data).data, status=status.HTTP_201_CREATED)

        reviews = self.get_object().review_set.select_related('user').all()
        paginator = paginators.ReviewPagination()
        page = paginator.paginate_queryset(reviews, request)
        if page:
            serializer = serializers.ReviewSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.ReviewSerializer(reviews, many=True).data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action.__eq__("create"):
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=["get", "patch"], detail=False, url_path="profile",
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
    permission_classes = [perms.IsStaff]


class ReviewViewSet(viewsets.ViewSet, generics.ListAPIView, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = serializers.ReviewSerializer
    permission_classes = [perms.IsReviewOwner | perms.IsStaff]
    pagination_class = paginators.ReviewPagination

    def get_permissions(self):
        if self.action.__eq__("list"):
            return [AllowAny()]
        return super().get_permissions()


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = serializers.OrderSerializer
    permission_classes = [perms.IsOrderOwner | perms.IsStaff]

    @action(methods=["get"], detail=True, url_path="details")
    def get_order_details(self, request, pk):
        order_details = self.get_object().orderdetail_set.select_related('order').all()
        return Response(serializers.OrderDetailSerializer(order_details, many=True).data, status=status.HTTP_200_OK)

    @action(methods=["get"], detail=False, url_path="my-orders", permission_classes=[perms.IsOrderOwner])
    def get_my_orders(self, request):
        user = request.user
        orders = self.queryset.filter(user=user).select_related('user').all()
        paginator = paginators.OrderPagination()
        page = paginator.paginate_queryset(orders, request)
        if page:
            serializer = serializers.OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=True, url_path='cancel', permission_classes=[perms.IsOrderOwner | perms.IsStaff])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.status == Order.Status.PAID:
            return Response({"detail": "Chỉ được huỷ đơn hàng chưa thanh toán"}, status=status.HTTP_400_BAD_REQUEST)

        if order.status == Order.Status.CANCELLED:
            return Response({"detail": "Đơn hàng đã huỷ trước đó"}, status=status.HTTP_400_BAD_REQUEST)

        reason_cancel = request.data.get('reason_cancel', '')
        order.status = Order.Status.CANCELLED
        order.reson_cancel = reason_cancel
        order.save()

        # Cập nhật lại số lượng sản phẩm trong kho
        for item in order.orderdetail_set.all():
            product = item.product
            if product:
                product.quantity += item.quantity
                product.save()

        return Response({"detail": f'Đơn hàng #{order.pk} huỷ thành công'}, status=status.HTTP_200_OK)


class DiscountViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Discount.objects.all()
    serializer_class = serializers.DiscountSerializer
    pagination_class = paginators.DiscountPagination

    def get_queryset(self):
        query = self.queryset
        if self.action.__eq__("list"):
            code = self.request.query_params.get("code")
            if code:
                query = query.filter(code__icontains=code)
        return query


class PaymentViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [perms.IsStaff | perms.IsOrderOwner]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.validated_data['order']
        # payment = Payment.objects.create(
        #     order=order,
        #     amount=order.total_price,
        #     method=serializer.validated_data.get('method', Payment.Method.CASH),
        #     status=Payment.Status.PENDING
        # )
        payment_url = create_vnpay_url(request, order)

        return Response({"payment_url": payment_url}, status=status.HTTP_200_OK)

    @action(methods=["get"], detail=False, url_path="vnpay_return", permission_classes=[])
    def vnpay_return(self, request):
        return vnpay.payment_ipn(request)

    @action(methods=["get"], detail=True, url_path="payment-details",
            permission_classes=[perms.IsStaff | perms.IsOrderOwner])
    def get_payment_details(self, request, pk):
        order = self.get_object()
        payment = order.payment_set.select_related('order').first()
        if not payment:
            return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializers.PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class GoodsReceiptViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = GoodsReceipt.objects.all()
    serializer_class = serializers.GoodsReceiptSerializer
    permission_classes = [perms.IsStaff]

    @action(methods=["get"], detail=True, url_path="details", permission_classes=[perms.IsStaff])
    def get_goods_receipt_details(self, request, pk):
        goods_receipt_details = self.get_object().goodsreceiptdetail_set.select_related('goods_receipt').all()
        return Response(serializers.GoodsReceiptDetailSerializer(goods_receipt_details, many=True).data,
                        status=status.HTTP_200_OK)