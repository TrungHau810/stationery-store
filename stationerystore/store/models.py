from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Active(models.Model):
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    """
    Model User: Lưu trữ thông tin tài khoản người dùng như:
        Tên đăng nhập, mật khẩu, họ tên, email, số điện thoại, ảnh đại diện, vai trò...
    """
    ROLE_CHOICES = (
        ('admin', 'Quản trị viên'),
        ('customer', 'Khách hàng'),
        ('manager', 'Quản lý'),
        ('staff', 'Nhân viên'),
    )
    number_phone = models.CharField(max_length=11, null=True, unique=True)
    avatar = CloudinaryField(null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=False, null=False)
    address = models.CharField(max_length=255, null=True)

    def __str__(self):
        return self.username


class LoyaltyPoint(BaseModel):
    total_point = models.IntegerField(default=0)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.total_point} điểm"


class Category(BaseModel, Active):
    name = models.CharField(max_length=150, null=False, unique=True)
    description = models.TextField(null=True, blank=True)
    category_parent = models.ForeignKey('Category', on_delete=models.CASCADE,
                                        related_name="category_children",
                                        null=True,
                                        blank=True)

    def __str__(self):
        return self.name


class Product(BaseModel, Active):
    name = models.CharField(max_length=255, null=False)
    description = RichTextField(null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = CloudinaryField()
    quantity = models.IntegerField(null=False, blank=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    discount = models.ManyToManyField('Discount', null=True, blank=True)
    brand = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['id']


class ProductImage(BaseModel):
    link = CloudinaryField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')

    def __str__(self):
        return f"Ảnh sản phẩm #{self.id} - {self.product.name} "


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    logo = CloudinaryField()
    number_phone = models.CharField(max_length=13)
    address = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Order(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Đã đặt hàng"
        PAID = "PAID", "Đã thanh toán"
        SHIPPING = "SHIPPING", "Đang giao hàng"
        DELIVERED = "DELIVERED", "Đã giao hàng"
        CANCELED = "CANCELED", "Đã huỷ"

    note = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=Status, default=Status.PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    discount = models.ForeignKey('Discount', on_delete=models.SET_NULL, null=True, blank=True)
    reson_cancel = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"#{self.id} - {self.user.full_name if self.user else 'Anonymous'} ({self.user.username if self.user else 'Anonymous'})"

    class Meta:
        ordering = ['-created_date']


class OrderDetail(models.Model):
    quantity = models.IntegerField()
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    def __str__(self):
        return f"#{self.id} - Mã đơn hàng #{self.order.id} - Tên SP: {self.product.name} - SL: {self.quantity}"


class LoyaltyPointHistory(BaseModel):
    class Type(models.TextChoices):
        EARN = "EARN", "Tích điểm"
        REDEEM = "REDEEM", "Đổi điểm"

    point = models.IntegerField(null=False)
    type = models.CharField(max_length=10, choices=Type, default=Type.EARN)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}  {self.get_type_display()} {self.point} điểm"


class GoodsReceipt(BaseModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Receipt {self.id} - Supplier {self.supplier.name if self.supplier else 'Unknown'} - User {self.user.username if self.user else 'Anonymous'}"


class GoodsReceiptDetail(models.Model):
    quantity = models.IntegerField(null=False, blank=False)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    goods_receipt = models.ForeignKey(GoodsReceipt, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id} - Receipt {self.goods_receipt.id} - Product {self.product.name} - Quantity {self.quantity}"


class Discount(BaseModel):
    code = models.CharField(max_length=50, null=False)
    discount = models.IntegerField()
    start_date = models.DateTimeField(null=False)
    end_date = models.DateTimeField(null=False)

    def __str__(self):
        return f"Mã: {self.code} - Giảm {self.discount}% - từ {self.start_date.strftime('%d/%m/%Y %H:%M')} đến {self.end_date.strftime('%d/%m/%Y %H:%M')}"


class Payment(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Đã chờ"
        SUCCESS = "success", "Thành công"
        FAIL = "fail", "Thất bại"

    class Method(models.TextChoices):
        MOMO = "momo", "MoMo"
        CASH = "cash", "Tiền mặt"
        VNPAY = "vnpay", "VNPay"

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=Status, default=Status.PENDING)
    method = models.CharField(max_length=50, choices=Method, default=Method.CASH)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)


class Review(BaseModel):
    rating = models.IntegerField()
    comment = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    reply = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    def __str__(self):
        return f"{self.user.full_name if self.user else 'Anonymous'} (username: {self.user.username if self.user else "Anonymous"}) - {self.product.name} - {self.rating} sao"

    class Meta:
        ordering = ['-created_date']

class ReviewImage(BaseModel):
    link = CloudinaryField(null=True)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')

    def __str__(self):
        return f"Hình ảnh đánh giá sản phẩm #{self.review.product.pk} {self.review.product.name}"


class Conversation(BaseModel):
    staff = models.ForeignKey(User, related_name="staff_conversation", on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey(User, related_name="customer_conversation", on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = ('staff', 'customer')

    def __str__(self):
        return f"Conversation between {self.staff.username if self.staff else 'Staff'} and {self.customer.username if self.customer else 'Customer'}"


class Message(BaseModel):
    content = models.TextField(null=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)


class OTP(models.Model):
    code = models.CharField(max_length=6)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.user.username} - Code: {self.code}"