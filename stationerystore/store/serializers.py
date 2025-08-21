from cloudinary.provisioning import users
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from store.models import Category, Supplier, Product, Review, User, Order, OrderDetail, Payment, Discount, GoodsReceipt, \
    GoodsReceiptDetail, ProductImage
from store.utils import vnpay


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ImageProductSerializer(ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.link:
            data['link'] = instance.link.url
        return data


class ProductSerializer(ModelSerializer):
    images = ImageProductSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "created_date", "updated_date", "name", "description", "price", "image", "quantity", "category", "brand", "images"]

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
        user.save()

        return user


class SupplierSerializer(ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ReviewSerializer(ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class OrderDetailSerializer(ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)

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

        total_price = 0
        for detail in order_details:
            try:
                product = Product.objects.get(pk=detail["product_id"])
                total_price += product.price * detail["quantity"]
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Sản phẩm id={detail['product_id']} không tồn tại")

        if total_price <= 0:
            raise serializers.ValidationError("Tổng tiền phải lớn hơn 0.")

        voucher_code = self.initial_data.get("discount", None)
        if voucher_code:
            try:
                discount = Discount.objects.get(pk=voucher_code)
                if discount.start_date > timezone.now() or discount.end_date < timezone.now():
                    raise serializers.ValidationError("Mã giảm giá không hợp lệ hoặc đã hết hạn.")
                total_price -= (total_price * discount.discount / 100)
            except Discount.DoesNotExist:
                raise serializers.ValidationError("Mã giảm giá không tồn tại.")

        # gán thêm vào validated_data để dùng trong create
        data["total_price"] = total_price
        data["order_details"] = order_details
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        order_details = validated_data.pop('order_details', [])
        order = Order.objects.create(user=user, **validated_data)
        for detail in order_details:
            OrderDetail.objects.create(order=order, **detail)
        return order


class PaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

    # def create(self, validated_data):
    #     order = validated_data.get('order')
    #     request = self.context['request']
    #     print(order)
    #     if not order:
    #         raise serializers.ValidationError("Đơn hàng không được để trống.")
    #
    #     # Kiểm tra trạng thái đơn hàng
    #     # if order.status != Order.Status.PAID:
    #     #     raise serializers.ValidationError("Chỉ có thể thanh toán cho đơn hàng đã thanh toán.")
    #
    #     return Response(
    #         vnpay.create_vnpay_url(request, order), status=status.HTTP_200_OK
    #     )


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
