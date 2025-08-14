from django.contrib import admin
from django.utils.safestring import mark_safe

from store.models import User, Category, Product, Discount, Order, Supplier, Review, Payment, OrderDetail, GoodsReceipt, \
    GoodsReceiptDetail, Conversation, Message


class UserAdmin(admin.ModelAdmin):
    search_fields = ['username', 'email']
    list_display = ['username', 'email', 'full_name', 'number_phone', 'role', 'is_active']
    readonly_fields = ['avatar_view']

    def avatar_view(self, user):
        if user.avatar:
            return mark_safe(f"<img src={user.avatar.url} width='150' />")
        return "Không có ảnh đại diện"


class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'price', 'quantity', 'active']
    readonly_fields = ['image_view']

    def image_view(self, product):
        return mark_safe(f"<img src={product.image.url} width='250' />")


class SupplierAdmin(admin.ModelAdmin):
    empty_value_display = "-Không có-"
    list_display = ['id', 'name', 'address', 'number_phone']


class StationeryAdminSite(admin.AdminSite):
    site_header = 'Open Stationery Store'


admin_site = StationeryAdminSite(name='myadmin')

admin_site.register(User, UserAdmin)
admin_site.register(Category)
admin_site.register(Product, ProductAdmin)
admin_site.register(Discount)
admin_site.register(Order)
admin_site.register(OrderDetail)
admin_site.register(Supplier, SupplierAdmin)
admin_site.register(Payment)
admin_site.register(GoodsReceipt)
admin_site.register(GoodsReceiptDetail)
admin_site.register(Review)
admin_site.register(Conversation)
admin_site.register(Message)
