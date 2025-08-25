from django.contrib import admin
from django.db.models import Sum
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from django.urls import path
from oauth2_provider.models import AccessToken

from store.models import User, Category, Product, Discount, Order, Supplier, Review, Payment, OrderDetail, GoodsReceipt, \
    GoodsReceiptDetail, Conversation, Message, ProductImage, ReviewImage


class UserAdmin(admin.ModelAdmin):
    search_fields = ['username', 'email']
    list_display = ['username', 'email', 'full_name', 'number_phone', 'role', 'is_active']
    readonly_fields = ['avatar_view']

    def avatar_view(self, user):
        if user.avatar:
            return mark_safe(f"<img src={user.avatar.url} width='150' />")
        return "Không có ảnh đại diện"

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_parent', 'description', 'active']
    search_fields = ['name']
    empty_value_display = "-Không có-"


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    verbose_name = "Hình ảnh sản phẩm"
    verbose_name_plural = "Hình ảnh sản phẩm"
    readonly_fields = ['image_view']

    def image_view(self, product_image):
        return mark_safe(f"<img src={product_image.link.url} width='150' />")


class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'brand', 'price', 'quantity', 'active']
    search_fields = ['id', 'name', 'category__name', 'brand__name']
    list_filter = ['category', 'brand', 'active']
    empty_value_display = "-Không có-"
    readonly_fields = ['image_view']
    inlines = [ProductImageInline]

    def image_view(self, product):
        return mark_safe(f"<img src={product.image.url} width='250' />")


class SupplierAdmin(admin.ModelAdmin):
    empty_value_display = "-Không có-"
    list_display = ['id', 'name', 'address', 'number_phone']
    search_fields = ['name']


class ProductInlineDiscountAdmin(admin.TabularInline):
    model = Product.discount.through
    extra = 1
    verbose_name = "Sản phẩm áp dụng giảm giá"
    verbose_name_plural = "Sản phẩm áp dụng giảm giá"


class OrderDetailInlineOrderAdmin(admin.TabularInline):
    model = OrderDetail
    extra = 1
    verbose_name = "Chi tiết đơn hàng"
    verbose_name_plural = "Chi tiết đơn hàng"


class GoodsReceiptDetailInlineAdmin(admin.TabularInline):
    model = GoodsReceiptDetail
    extra = 1
    verbose_name = "Chi tiết phiếu nhập hàng"
    verbose_name_plural = "Chi tiết phiếu nhập hàng"


class DiscountAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount', 'start_date', 'end_date']
    search_fields = ['code']
    list_filter = ['start_date', 'end_date']
    inlines = [ProductInlineDiscountAdmin]


class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_price', 'status', 'created_date', 'updated_date']
    search_fields = ['user__username', 'user__email']
    list_filter = ['status', 'created_date']
    emty_value_display = "-Không có-"
    inlines = [OrderDetailInlineOrderAdmin]


class GoodsReceiptAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'supplier', 'created_date', 'updated_date']
    search_fields = ['supplier__name']
    list_filter = ['created_date', 'supplier']
    inlines = [GoodsReceiptDetailInlineAdmin]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """Customize form fields for GoodsReceiptAdmin."""
        if db_field.name == 'user':
            kwargs['queryset'] = User.objects.filter(role="staff")
        return super().formfield_for_dbfield(db_field, request, **kwargs)


class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 1
    verbose_name = "Hình ảnh đánh giá"
    verbose_name_plural = "Hình ảnh đánh giá"
    readonly_fields = ['image_view']

    def image_view(self, review_image):
        return mark_safe(f"<img src={review_image.link.url} width='150' />")


class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'rating', 'created_date']
    search_fields = ['user__username', 'product__name']
    list_filter = ['rating', 'created_date']
    empty_value_display = "-Không có-"
    inlines = [ReviewImageInline]


class StationeryAdminSite(admin.AdminSite):
    site_header = 'TH Store Administration'
    site_title = 'TH Store Admin'
    index_title = 'Trang quản trị TH Store'

    def get_urls(self):
        return [path('store-stats/', self.store_stats)] + super().get_urls()

    def store_stats(self, request):
        total_revenue = Order.objects.all().aggregate(total=Sum('total_price'))['total'] or 0
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_categories = Category.objects.count()
        total_suppliers = Supplier.objects.count()
        products = Product.objects.all()

        return TemplateResponse(request, 'admin/store-stats.html', context={
            'total_revenue': total_revenue,
            'products': products,
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_categories': total_categories,
            'total_suppliers': total_suppliers,
        })


admin_site = StationeryAdminSite(name='myadmin')

admin_site.register(User, UserAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Discount, DiscountAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(OrderDetail)
admin_site.register(Supplier, SupplierAdmin)
admin_site.register(Payment)
admin_site.register(GoodsReceipt, GoodsReceiptAdmin)
admin_site.register(GoodsReceiptDetail)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Conversation)
admin_site.register(Message)

admin_site.register(AccessToken)
