from datetime import datetime

from django.contrib import admin
from django.db.models import Sum
from django.db.models.functions import ExtractYear, ExtractQuarter, ExtractMonth
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from django.urls import path
from oauth2_provider.models import AccessToken

from store.models import User, Category, Product, Discount, Order, Supplier, Review, Payment, OrderDetail, GoodsReceipt, \
    GoodsReceiptDetail, Conversation, Message, ProductImage, ReviewImage, LoyaltyPoint, LoyaltyPointHistory, OTP


class UserAdmin(admin.ModelAdmin):
    search_fields = ['username', 'email']
    list_display = ['id', 'username', 'email', 'full_name', 'number_phone', 'role', 'is_active']
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
    list_display = ['name', 'description', 'active']
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
    readonly_fields = ['logo_view']

    def logo_view(self, supplier):
        return mark_safe(f"<img src={supplier.logo.url} width='150' />")


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
    filter_horizontal = ['products']


class LoyaltyPointHistoryInline(admin.TabularInline):
    model = LoyaltyPointHistory
    extra = 1
    verbose_name = "Lịch sử điểm thưởng"
    verbose_name_plural = "Lịch sử điểm thưởng"


class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_price', 'payment_method', 'status', 'created_date', 'updated_date']
    search_fields = ['user__username', 'user__email']
    list_filter = ['status', 'created_date']
    emty_value_display = "-Không có-"
    inlines = [OrderDetailInlineOrderAdmin, LoyaltyPointHistoryInline]


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


class LoyaltyPointAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_point', 'created_date', 'updated_date']
    search_fields = ['user__username', 'user__full_name', 'user__number_phone', 'user__email']
    empty_value_display = "-Không có-"


class LoyaltyPointHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'point', 'type', 'created_date', 'order']
    search_fields = ['user__username']
    list_filter = ['created_date']
    empty_value_display = "-Không có-"


class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'method', 'amount', 'status', 'created_date']
    search_fields = ['order__id', 'method']
    list_filter = ['method', 'status', 'created_date']
    empty_value_display = "-Không có-"


class StationeryAdminSite(admin.AdminSite):
    site_header = 'Hệ thống quản trị Open Stationery Store'
    index_title = 'Hệ thống quản trị'
    site_title = 'Trang quản trị | Open Stationery Store'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'store-stats/',
                self.admin_view(self.store_stats),  # quan trọng: dùng admin_view để áp quyền admin
                name="store_stats"
            ),
        ]
        return custom_urls + urls

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }

    def store_stats(self, request):
        # --- Lấy năm từ query string ---
        selected_year = request.GET.get("year")
        if selected_year is None:
            selected_year = datetime.now().year
        else:
            selected_year = int(selected_year)

        # --- Thống kê tổng quan ---
        total_revenue = (
                Order.objects.exclude(status=Order.Status.CANCELED)
                .aggregate(total=Sum('total_price'))['total'] or 0
        )
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_categories = Category.objects.count()
        total_suppliers = Supplier.objects.count()
        products = Product.objects.all()

        total_revenue = f'{total_revenue:,.0f}'.replace(",", ".")

        sold_per_product = (
            OrderDetail.objects
            .exclude(order__status=Order.Status.CANCELED)
            .values('product__id', 'product__name', 'product__image')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')
        )

        cancel_percent = (
                Order.objects.filter(status=Order.Status.CANCELED).count() / total_orders * 100
        ) if total_orders > 0 else 0
        cancel_order_count = Order.objects.filter(status=Order.Status.CANCELED).count()

        # --- Doanh thu theo tháng (lọc theo năm chọn) ---
        revenue_per_month = list(
            Order.objects.exclude(status=Order.Status.CANCELED)
            .filter(created_date__year=selected_year)
            .annotate(month=ExtractMonth('created_date'))
            .values('month')
            .annotate(total_revenue=Sum('total_price'))
            .order_by('month')
        )
        for r in revenue_per_month:
            r['total_revenue'] = float(r['total_revenue'] or 0)

        # --- Doanh thu theo quý (lọc theo năm chọn) ---
        revenue_per_quarter = list(
            Order.objects.exclude(status=Order.Status.CANCELED)
            .filter(created_date__year=selected_year)
            .annotate(quarter=ExtractQuarter('created_date'))
            .values('quarter')
            .annotate(total_revenue=Sum('total_price'))
            .order_by('quarter')
        )
        for r in revenue_per_quarter:
            r['total_revenue'] = float(r['total_revenue'] or 0)

        # --- Doanh thu theo năm (không lọc, để so sánh nhiều năm) ---
        revenue_per_year = list(
            Order.objects.exclude(status=Order.Status.CANCELED)
            .annotate(year=ExtractYear('created_date'))
            .values('year')
            .annotate(total_revenue=Sum('total_price'))
            .order_by('year')
        )
        for r in revenue_per_year:
            r['total_revenue'] = float(r['total_revenue'] or 0)

        # --- Lấy danh sách các năm có dữ liệu ---
        years = [d.year for d in Order.objects.dates('created_date', 'year', order='DESC')]

        return TemplateResponse(request, 'admin/store-stats.html', context={
            'total_revenue': total_revenue,
            'products': products,
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_categories': total_categories,
            'total_suppliers': total_suppliers,
            'sold_per_product': sold_per_product,
            'cancel_percent': f'{cancel_percent:.2f}',
            'cancel_order_count': cancel_order_count,
            'revenue_per_month': revenue_per_month,
            'revenue_per_quarter': revenue_per_quarter,
            'revenue_per_year': revenue_per_year,
            'years': years,
            'selected_year': selected_year,
        })


admin_site = StationeryAdminSite(name='myadmin')

admin_site.register(User, UserAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Discount, DiscountAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(OrderDetail)
admin_site.register(Supplier, SupplierAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(GoodsReceipt, GoodsReceiptAdmin)
admin_site.register(GoodsReceiptDetail)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Conversation)
admin_site.register(Message)
admin_site.register(LoyaltyPoint, LoyaltyPointAdmin)
admin_site.register(LoyaltyPointHistory, LoyaltyPointHistoryAdmin)

# admin_site.register(AccessToken)
