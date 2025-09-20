import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = "http://192.168.1.6:8000/";

export const endpoint = {
    "send_otp": "/verified/send-otp/",
    "login": "/oauth2/token/",
    "google-login": "/user/google-login/",
    "register": "/user/",
    "verify": "/user/verified/",
    "profile": "/user/profile/",
    'change_password': '/user/change-password/',
    "reset_password": "/user/reset-password/",
    "all_user": "/user/",

    // Nhà cung cấp
    "suppliers": "/suppliers/",
    "supplier": (id) => `/suppliers/${id}/`,

    // Phiếu nhập hàng
    'goods_receipt': '/goods-receipts/',
    'goods_receipt_detail': (id) => `/goods-receipts/${id}/details/`,

    //  Mã giảm giá
    "discounts_of_product": (id) => `/products/${id}/discounts/`,
    "discount": "/discounts/",
    "discount_detail": (id) => `/discounts/${id}/`,

    // Điểm thưởng
    "loyalty": "/loyalty-points/my-loyalty-point/",
    "loyalty_history": "/loyalty-point-histories/",

    // Danh mục
    "category": "/categories/",

    // Sản phẩm
    "product": "/products/",
    "product_detail": (id) => `/products/${id}/`,

    // Đánh giá sản phẩm
    "reviews_of_product": (id) => `/products/${id}/reviews/`,

    // API cho quản lý
    "products_pending": "/products/pending/",

    // Đánh giá
    "reviews": "/reviews/",
    "review_detail": (id) => `/reviews/${id}/`,
    // Trả lời đánh giá
    "add_reply": (id) => `/reviews/${id}/reply/`,

    // Giỏ hàng
    'cart': '/cart/',
    'add_to_cart': '/cart/add-to-cart/',
    'remove_from_cart': '/cart/remove-from-cart/',
    'clear_cart': '/cart/clear-cart/',

    // Đơn hàng
    'my_orders': '/orders/my-orders/',
    'create_order': '/orders/',
    'get_all_orders': '/orders/',
    'order': (id) => `/orders/${id}/`,
    'order_detail': (id) => `/orders/${id}/detail/`,
    'cancel_order': (id) => `/orders/${id}/cancel/`,
    'order_items': (id) => `/order-details/?order_id=${id}`,


    // Thống kê
    'total_revenue': "/report/total-revenue/",
    'monthly_revenue': '/report/monthly-revenue/',
    'top_products': '/report/top-products/',
    'today_orders': '/report/today-orders/',
    'today_revenue': '/report/today-revenue/',
    'revenue_by_date': '/report/revenue-by-date/',
    'revenue_by_month': '/report/revenue-by-month/',
    'revenue_by_year': '/report/revenue-by-year/',
    'revenue_by_quarter': '/report/revenue-by-quarter/',
    'revenue_month_present': '/report/revenue-month-present/',

    // Thanh toán
    'create_payment': '/payments/',
    'confirm_payment_vnpay': '/payments/vnpay_return/',
    'confirm_payment_momo': '/payments/momo_return/',
    'verify_payment': '/payments/verify/',

    // Chatbot
    'chatbot_customer': '/gemini-ai/customer-ask/',

}

export const authApis = () => axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${cookie.load("token")}`
    }
})

export default axios.create({
    baseURL: BASE_URL
});