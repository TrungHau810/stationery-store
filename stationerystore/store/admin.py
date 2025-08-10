from django.contrib import admin
from django.urls import path

from store.models import User, Category, Product, Discount, Order, Supplier, Review, Payment, OrderDetail, GoodsReceipt, \
    GoodsReceiptDetail


# Register your models here.

class StationeryAdminSite(admin.AdminSite):
    site_header = 'Open Stationery Store'



admin_site = StationeryAdminSite(name='myadmin')

admin_site.register(User)
admin_site.register(Category)
admin_site.register(Product)
admin_site.register(Discount)
admin_site.register(Order)
admin_site.register(OrderDetail)
admin_site.register(Supplier)
admin_site.register(Payment)
admin_site.register(GoodsReceipt)
admin_site.register(GoodsReceiptDetail)
admin_site.register(Review)