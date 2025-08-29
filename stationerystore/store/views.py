import random
from datetime import timedelta
from django.utils import timezone

from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from store import serializers, paginators, perms
from store.models import Category, Supplier, Product, Review, User, Order, Discount, GoodsReceipt, Payment, \
    ProductImage, ReviewImage, LoyaltyPoint, LoyaltyPointHistory, Cart, CartItem, OTP
from store.utils import vnpay, momo, email


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer

    def get_permissions(self):
        if self.action.__eq__("create"):
            return [perms.IsStaff()]
        return [AllowAny()]

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

    @action(methods=['get'], detail=True, url_path='discounts')
    def get_discounts_of_product(self, request, pk):
        product = self.get_object()
        discounts = product.discount.all()
        return Response(serializers.DiscountSerializer(discounts, many=True).data, status=status.HTTP_200_OK)

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
        if self.action.__eq__("verify_user") or self.action.__eq__("send_otp"):
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

    @action(methods=["patch"], detail=False, url_path="verified")
    def verify_user(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(email=email).exists():
            return Response({"detail": "Địa chỉ email không được tìm thấy"}, status=status.HTTP_404_NOT_FOUND)
        user = User.objects.get(email=email)
        if user.is_active == True:
            return Response({"detail": "Tài khoản đã được xác thực"}, status=status.HTTP_400_BAD_REQUEST)
        otp_code = request.data.get('otp_code')
        if not otp_code:
            return Response({"detail": "Mã OTP là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)
        otp_record = OTP.objects.filter(user=user, code=otp_code).order_by('-created_at').first()
        if not otp_record:
            return Response({"detail": "Mã OTP không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.now() > otp_record.created_at + timedelta(minutes=10):
            return Response({"detail": "Mã OTP đã hết hạn"}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()
        otp_record.delete()
        return Response({"detail": "Xác thực tài khoản thành công"}, status=status.HTTP_200_OK)


class LoyaltyPointViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = LoyaltyPoint.objects.all()
    serializer_class = serializers.LoyaltyPointSerializer
    permission_classes = [perms.IsOwnerLoyaltyPoint | perms.IsStaff]

    @action(methods=['get'], detail=False, url_path='my-loyalty-point', permission_classes=[perms.IsOwnerLoyaltyPoint])
    def get_my_loyalty_point(self, request):
        loyalty_point = LoyaltyPoint.objects.filter(user__pk=self.request.user.pk).first()
        print(loyalty_point)
        if not loyalty_point:
            return Response({"detail": "Loyalty point not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializers.LoyaltyPointSerializer(loyalty_point).data, status=status.HTTP_200_OK)


class LoyaltyPointHistoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = LoyaltyPointHistory.objects.all()
    serializer_class = serializers.LoyaltyPointHistorySerializer
    pagination_class = paginators.LoyaltyPointHistoryPagination
    permission_classes = [perms.IsOwnerLoyaltyPointHistory | perms.IsStaff]

    def get_queryset(self):
        query = self.queryset
        if self.action.__eq__("list"):
            user_id = self.request.user.pk
            if user_id:
                query = query.filter(user__pk=user_id)
        return query


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

    @action(methods=["get"], detail=True, url_path="detail")
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

        if order.status == Order.Status.CANCELED:
            return Response({"detail": "Đơn hàng đã huỷ trước đó"}, status=status.HTTP_400_BAD_REQUEST)

        reason_cancel = request.data.get('reason_cancel', '')
        order.status = Order.Status.CANCELED
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
        method = serializer.validated_data.get('method', Payment.Method.CASH)

        if method == Payment.Method.VNPAY:
            payment_url = vnpay.create_vnpay_url(request, order)
        elif method == Payment.Method.MOMO:
            # redirect_url và ipn_url có thể lấy từ settings hoặc request
            from django.conf import settings
            redirect_url = getattr(settings, 'MOMO_REDIRECT_URL',
                                   'http://localhost:8000/b3088a6a-2d17-4f8d-a383-71389a6c600b')
            ipn_url = getattr(settings, 'MOMO_IPN_URL', 'https://localhost:8000/b3088a6a-2d17-4f8d-a383-71389a6c600b')
            payment_url = momo.create_momo_url(order, redirect_url, ipn_url)
        else:
            payment_url = None

        return Response({"payment_url": payment_url}, status=status.HTTP_200_OK)

    @action(methods=["get"], detail=False, url_path="vnpay_return", permission_classes=[])
    def vnpay_return(self, request):
        return vnpay.payment_ipn(request)

    @action(methods=["post"], detail=False, url_path="momo_ipn", permission_classes=[])
    def momo_ipn(self, request):
        # Xử lý callback từ Momo (tùy chỉnh theo yêu cầu)
        data = request.data
        # TODO: kiểm tra và cập nhật trạng thái đơn hàng
        return Response({"message": "IPN từ Momo nhận thành công", "data": data})

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


class CartViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = serializers.CartSerializer
    permission_classes = [perms.IsOwnerCart]

    def get_queryset(self):
        query = self.queryset
        if self.action.__eq__("list"):
            user_id = self.request.user.pk
            if user_id:
                query = query.filter(user__pk=user_id)
        return query

    @action(methods=['post'], detail=False, url_path='add-to-cart')
    def add_to_cart(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Kiểm tra số lượng
        if quantity < 1:
            return Response({"detail": "Số lượng sản phẩm phải từ 1"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra sản phẩm có tồn tại
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Không tìm thấy sản phẩm"}, status=status.HTTP_404_NOT_FOUND)
        # Kiểm tra số lượng trong kho
        if product.quantity < quantity:
            return Response({"detail": "Sản phẩm đã được bán hết"}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy hoặc tạo cart cho user
        cart, _ = Cart.objects.get_or_create(user=user)

        # Lấy hoặc tạo cart item
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity += quantity
        cart_item.save()

        # Trả về toàn bộ giỏ hàng
        return Response(serializers.CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='remove-from-cart')
    def remove_from_cart(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response({"detail": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        except CartItem.DoesNotExist:
            return Response({"detail": "Product not in cart"}, status=status.HTTP_404_NOT_FOUND)

        # giảm số lượng
        if cart_item.quantity > quantity:
            cart_item.quantity -= quantity
            cart_item.save()
        else:
            cart_item.delete()  # nếu hết thì xoá hẳn

        return Response(serializers.CartSerializer(cart).data, status=status.HTTP_200_OK)


class OTPViewSet(viewsets.ViewSet, generics.CreateAPIView):
    serializer_class = serializers.OTPSerializer

    @action(methods=['post'], detail=False, url_path='send-otp')
    def send_otp(self, request):
        email_address = request.data.get('email')
        if not email_address:
            return Response({"detail": "Email là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(email=email_address).exists():
            return Response({"detail": "Địa chỉ email không được tìm thấy"}, status=status.HTTP_404_NOT_FOUND)

        user = User.objects.get(email=email_address)
        if user.is_active == True:
            return Response({"detail": "Tài khoản đã được xác thực"}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo mã OTP ngẫu nhiên
        otp = random.randint(100000, 999999)

        # Gửi OTP qua email
        try:
            email.send_otp_via_email(email_address, otp)
        except Exception as e:
            return Response({"detail": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Lưu OTP vào cơ sở dữ liệu
        OTP.objects.create(user=user, code=otp)

        return Response({"detail": f"Gửi thành công mã OTP về email {email_address}"}, status=status.HTTP_200_OK)