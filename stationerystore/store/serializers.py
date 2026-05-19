from django.db import transaction
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.serializers import ModelSerializer

from store.models import Category, Supplier, Product, Review, User, Order, OrderDetail, Payment, Discount, GoodsReceipt, \
    GoodsReceiptDetail, ProductImage, ReviewImage, LoyaltyPoint, LoyaltyPointHistory, CartItem, Cart, OTP
from store.utils import vnpay
from store.utils.email import send_order_success_email


class SupplierSerializer(ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

    def create(self, validated_data):
        return Category.objects.create(**validated_data)


class ProductImageSerializer(ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.link:
            data['link'] = instance.link.url
        return data


class ProductSerializer(ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)
    count_reviews = serializers.SerializerMethodField(read_only=True)
    brand = SupplierSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "created_date", "updated_date", "name", "description", "price", "image", "quantity", "category",
                  "brand", "images", "average_rating", "count_reviews", "active"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data

    def create(self, validated_data):
        # Lấy brand từ context
        brand_id = self.initial_data.get("brand")
        if not brand_id:
            raise serializers.ValidationError("Nhà cung cấp không hợp lệ.")

        brand = Supplier.objects.get(pk=brand_id) if brand_id else None

        if not brand:
            raise serializers.ValidationError("Nhà cung cấp không tồn tại.")

        # Tạo sản phẩm
        product = Product.objects.create(brand=brand, **validated_data)

        # Tạo ảnh thumbnail từ image chính
        if product.image:
            ProductImage.objects.create(link=product.image, product=product)

        # Tạo thêm các ảnh khác nếu có trong context
        request = self.context.get("request")
        extra_images = request.FILES.getlist("images") if request else []
        if extra_images:
            for img in extra_images:
                ProductImage.objects.create(link=img, product=product)

        # Mặc định sản phẩm chưa active
        product.active = False
        product.save()
        return product

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(reply_id__isnull=True)
        if reviews.exists():
            return reviews.aggregate(avg_rating=Avg('rating'))['avg_rating']
        return 0.0

    def get_count_reviews(self, obj):
        return obj.reviews.filter(reply_id__isnull=True).count()


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        exclude = ['groups', 'user_permissions']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(validated_data['password'])
        user.is_active = False
        user.save()

        LoyaltyPoint.objects.create(user=user, total_point=0)
        Cart.objects.create(user=user)
        return user


class LoyaltyPointSerializer(ModelSerializer):
    class Meta:
        model = LoyaltyPoint
        fields = '__all__'


class LoyaltyPointHistorySerializer(ModelSerializer):
    class Meta:
        model = LoyaltyPointHistory
        fields = '__all__'


class ReviewImageSerializer(serializers.ModelSerializer):
    link = serializers.ImageField(write_only=True)  # dùng khi create
    url = serializers.SerializerMethodField()  # dùng khi read

    class Meta:
        model = ReviewImage
        fields = ['id', 'link', 'url', 'review']

    def get_url(self, obj):
        return obj.link.url if obj.link else None

    def create(self, validated_data):
        return ReviewImage.objects.create(**validated_data)


class ReviewSerializer(ModelSerializer):
    images = ReviewImageSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    rating_breakdown = serializers.SerializerMethodField()
    reply = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'product', 'rating', 'comment',
            'created_date', 'images', 'rating_breakdown', 'reply'
        ]

    def get_rating_breakdown(self, obj):
        breakdown = (
            Review.objects
            .filter(product=obj.product, reply__isnull=True)
            .values('rating')
            .annotate(count=Count('id'))
        )
        counter = {item['rating']: item['count'] for item in breakdown}
        return {str(i): counter.get(i, 0) for i in range(1, 6)}

    def get_reply(self, obj):
        replies = obj.replies.all()
        return ReviewSerializer(replies, many=True, context=self.context).data


class OrderDetailSerializer(ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderDetail
        fields = ["id", "product_id", "order", "quantity", "product"]
        read_only_fields = ["id", "product"]

    def validate(self, attrs):
        try:
            product = Product.objects.get(pk=attrs["product_id"])
        except Product.DoesNotExist:
            raise serializers.ValidationError("Sản phẩm không tồn tại")

        if attrs["quantity"] > product.quantity:
            raise serializers.ValidationError("Số lượng tồn kho không đủ")

        return attrs


class OrderSerializer(ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

    def validate(self, data):
        request_method = self.context['request'].method

        order_details = self.initial_data.get("order_details", [])

        # Chỉ bắt buộc order_details khi tạo mới
        if request_method == "POST":
            if not order_details:
                raise serializers.ValidationError("Đơn hàng phải có ít nhất 1 sản phẩm.")

        # Nếu PATCH mà có gửi order_details thì vẫn validate như cũ
        if order_details:
            voucher_code = self.initial_data.get("discount", None)
            discount = None
            if voucher_code:
                try:
                    discount = Discount.objects.get(pk=voucher_code)
                    now = timezone.now()
                    if not (discount.start_date <= now <= discount.end_date):
                        raise serializers.ValidationError("Mã giảm giá không hợp lệ hoặc đã hết hạn.")
                    count = 0
                    for detail in order_details:
                        try:
                            product = Product.objects.get(pk=detail["product_id"])
                            if discount.products.filter(pk=product.pk).exists():
                                count += 1
                        except Product.DoesNotExist:
                            raise serializers.ValidationError(f"Sản phẩm id={detail['product_id']} không tồn tại")

                    if count < 1:
                        raise serializers.ValidationError("Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng.")
                except Discount.DoesNotExist:
                    raise serializers.ValidationError("Mã giảm giá không tồn tại.")

            total_price = 0
            for detail in order_details:
                try:
                    product = Product.objects.get(pk=detail["product_id"])
                    price = product.price
                    if discount and discount.products.filter(pk=product.pk).exists():
                        price = (price - (price * discount.discount / 100))
                    total_price += (price * detail["quantity"])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Sản phẩm id={detail['product_id']} không tồn tại")

            if total_price <= 0:
                raise serializers.ValidationError("Tổng tiền phải lớn hơn 0.")

            # Gán thêm vào validated_data
            data["total_price"] = total_price
            data["order_details"] = order_details

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        use_loyalty_point = user.loyaltypoint.total_point
        redeem_point = (use_loyalty_point // 1000) * 1000
        if redeem_point < 0:
            raise serializers.ValidationError("Điểm sử dụng không hợp lệ.")
        if redeem_point > use_loyalty_point:
            raise serializers.ValidationError("Bạn không có đủ điểm để sử dụng.")
        if redeem_point > validated_data['total_price']:
            raise serializers.ValidationError("Điểm sử dụng không được lớn hơn tổng tiền thanh toán.")
        validated_data['total_price'] -= redeem_point
        order_details = validated_data.pop('order_details', [])

        with transaction.atomic():
            # tạo đơn hàng trước
            order = Order.objects.create(user=user, **validated_data)

            for detail in order_details:
                # dùng select_for_update để khóa bản ghi product
                product = Product.objects.select_for_update().get(pk=detail["product_id"])
                if product.quantity < detail["quantity"]:
                    raise serializers.ValidationError(f"Sản phẩm {product.name} không đủ số lượng.")

                product.quantity -= detail["quantity"]
                product.save()

                OrderDetail.objects.create(order=order, **detail)

            # tính điểm thưởng
            points_earned = int(order.total_price) * 0.01
            if points_earned > 0:
                user.loyaltypoint.total_point = user.loyaltypoint.total_point - redeem_point + points_earned
                user.loyaltypoint.save()
                LoyaltyPointHistory.objects.create(
                    user=user,
                    point=int(points_earned),
                    type=LoyaltyPointHistory.Type.EARN,
                    order=order
                )

            if redeem_point > 0:
                LoyaltyPointHistory.objects.create(
                    user=user,
                    point=redeem_point,
                    type=LoyaltyPointHistory.Type.REDEEM,
                    order=order
                )
        # Tạm ngưng gửi mail
        # if order.payment_method == Order.PaymentMethod.CASH:
        #     send_order_success_email(order=order)
        return order


class PaymentSerializer(ModelSerializer):
    method = serializers.CharField(required=False)

    class Meta:
        model = Payment
        fields = '__all__'


class GoodsReceiptDetailSerializer(ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = GoodsReceiptDetail
        fields = ['id', 'goods_receipt', 'product', 'quantity']


class GoodsReceiptSerializer(serializers.ModelSerializer):
    # GET: hiển thị info supplier
    supplier = SupplierSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    goods_receipt_details = GoodsReceiptDetailSerializer(many=True, read_only=True)

    # POST: nhận supplier_id
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        write_only=True,
        source='supplier'  # khi create sẽ map sang field supplier
    )

    class Meta:
        model = GoodsReceipt
        fields = ['id', 'created_date', 'updated_date', 'supplier', 'supplier_id', 'user', 'goods_receipt_details']

    def validate(self, attrs):
        products = self.initial_data.get("goods_receipt_details", [])
        if not products:
            raise serializers.ValidationError("Phiếu nhập hàng phải có ít nhất 1 sản phẩm.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        products_data = self.initial_data.get("goods_receipt_details", [])
        supplier = validated_data.get('supplier')

        goods_receipt = GoodsReceipt.objects.create(user=user, supplier=supplier)

        for item in products_data:
            try:
                product = Product.objects.get(pk=item["product_id"])
                if product.brand != supplier:
                    raise serializers.ValidationError(
                        f"Sản phẩm id={item['product_id']} không thuộc nhà cung cấp {supplier.name}"
                    )
                product.quantity += item["quantity"]
                product.save()

                GoodsReceiptDetail.objects.create(
                    goods_receipt=goods_receipt,
                    product=product,
                    quantity=item["quantity"]
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Sản phẩm id={item['product_id']} không tồn tại")

        return goods_receipt


class CartItemSerializer(ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']


class CartSerializer(ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        # chỉ tạo giỏ hàng với user, không cần items
        cart, created = Cart.objects.get_or_create(user=user)
        return cart


class DiscountSerializer(ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    class Meta:
        model = Discount
        fields = ['id', 'code', 'start_date', 'end_date', 'discount', 'products', 'created_date', 'updated_date']


class OTPSerializer(serializers.Serializer):
    class Meta:
        model = OTP
        fields = '__all__'
