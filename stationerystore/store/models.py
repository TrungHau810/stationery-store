from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

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
        ('staff', 'Nhân viên'),
    )
    number_phone = models.CharField(max_length=11, null=False, unique=True)
    avatar = CloudinaryField(null=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=False, null=False)
    address = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.username


class Category(BaseModel):
    name = models.CharField(max_length=150, null=False, unique=True)
    description = models.TextField(null=True)


class Product(BaseModel):
    name = models.CharField(max_length=255, null=False)
    description = models.TextField(null=True)
    price = models.FloatField()


class Supplier(models.Model):
    name = models.CharField(max_length=255)



class Order(BaseModel):
    note = models.TextField(null=True)


class OrderDetail(models.Model):
    quantity = models.IntegerField()



class Discount(BaseModel):
    code = models.CharField(max_length=50, null=False)
    discount= models.IntegerField()
    end_date= models.DateField(null=False)


class Review(BaseModel):
    rating = models.IntegerField()
    comment = models.TextField()

