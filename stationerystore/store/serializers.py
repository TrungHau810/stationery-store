from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.serializers import ModelSerializer

from store.models import Category, Supplier, Product, Review, User, Order, OrderDetail, Payment, Discount, GoodsReceipt, \
    GoodsReceiptDetail, ProductImage, ReviewImage, LoyaltyPoint, LoyaltyPointHistory, CartItem, Cart, OTP
from store.utils import vnpay


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

    class Meta:
        model = Product
        fields = ["id", "created_date", "updated_date", "name", "description", "price", "image", "quantity", "category",
                  "brand", "discount", "images"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data

    def create(self, validated_data):
        return Product.objects.create(**validated_data)


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
        return user


class LoyaltyPointSerializer(ModelSerializer):
    class Meta:
        model = LoyaltyPoint
        fields = '__all__'


class LoyaltyPointHistorySerializer(ModelSerializer):
    class Meta:
        model = LoyaltyPointHistory
        fields = '__all__'


class SupplierSerializer(ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ReviewImageSerializer(ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.link:
            data['link'] = instance.link.url
        return data


class ReviewSerializer(ModelSerializer):
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'comment', 'created_date', 'images']


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
            print("Sản phẩm trong giỏ: ", product)
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
        order_details = self.initial_data.get("order_details", [])
        if not order_details:
            raise serializers.ValidationError("Đơn hàng phải có ít nhất 1 sản phẩm.")

        voucher_code = self.initial_data.get("discount", None)
        discount = None
        if voucher_code:
            try:
                discount = Discount.objects.get(pk=voucher_code)
                now = timezone.now()
                if not (discount.start_date <= now <= discount.end_date):
                    raise serializers.ValidationError("Mã giảm giá không hợp lệ hoặc đã hết hạn.")
            except Discount.DoesNotExist:
                raise serializers.ValidationError("Mã giảm giá không tồn tại.")

        total_price = 0
        for detail in order_details:
            try:
                product = Product.objects.get(pk=detail["product_id"])
                price = product.price
                if discount and product.discount.filter(pk=discount.pk).exists():
                    price = (price - (price * discount.discount / 100))
                total_price += (price * detail["quantity"])
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Sản phẩm id={detail['product_id']} không tồn tại")

        if total_price <= 0:
            raise serializers.ValidationError("Tổng tiền phải lớn hơn 0.")

        # gán thêm vào validated_data để dùng trong create
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

        return order

class PaymentSerializer(ModelSerializer):
    method = serializers.CharField(required=False)  # Thêm trường method để chọn phương thức

    class Meta:
        model = Payment
        fields = '__all__'


class DiscountSerializer(ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'


class GoodsReceiptSerializer(ModelSerializer):
    class Meta:
        model = GoodsReceipt
        fields = '__all__'

    def create(self, validated_data):
        user = self.context['request'].user
        goods_receipt = GoodsReceipt.objects.create(user=user, **validated_data)
        return goods_receipt


class GoodsReceiptDetailSerializer(ModelSerializer):
    class Meta:
        model = GoodsReceiptDetail
        fields = '__all__'


class CartItemSerializer(ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']


class CartSerializer(ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.create(user=user, **validated_data)
        return cart


class OTPSerializer(serializers.Serializer):
    class Meta:
        model = OTP
        fields = '__all__'
