import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = "http://192.168.1.7:8000/";

export const endpoint = {
    "send_otp": "/verified/send-otp/",
    "login": "/oauth2/token/",
    "register": "/user/",
    "verify": "/user/verified/",
    "profile": "/user/profile/",
    "all_user": "/user/",

    // Nhà cung cấp
    "suppliers": "/suppliers/",
    "supplier": (id) => `/suppliers/${id}/`,

    // Phiếu nhập hàng
    'goods_receipt': '/goods-receipts/',
    'goods_receipt_detail': (id) => `/goods-receipt/${id}/`,

    "discounts_of_product": (id) => `/products/${id}/discounts/`,
    "discount": "/discounts/",
    "discount_detail": (id) => `/discounts/${id}/`,

    "loyalty": "/loyalty-points/my-loyalty-point/",
    "loyalty_history": "/loyalty-point-histories/",

    "category": "/categories/",

    "product": "/products/",
    "product_detail": (id) => `/products/${id}/`,
    "reviews_of_product": (id) => `/products/${id}/reviews/`,

    // Đánh giá
    "reviews": "/reviews/",
    "review_detail": (id) => `/reviews/${id}/`,

    'cart': '/cart/',
    'add_to_cart': '/cart/add-to-cart/',
    'remove_from_cart': '/cart/remove-from-cart/',
    'clear_cart': '/cart/clear-cart/',

    'my_orders': '/orders/my-orders/',
    'create_order': '/orders/',
    'get_all_orders': '/orders/',
    'order': (id) => `/orders/${id}/`,
    'order_detail': (id) => `/orders/${id}/detail/`,
    'cancel_order': (id) => `/orders/${id}/cancel/`,

    // Revenue
    'total_revenue': "/report/total-revenue/",
    'monthly_revenue': '/report/monthly-revenue/',
    'top_products': '/report/top-products/',
    'today_orders': '/report/today-orders/',
    'today_revenue': '/report/today-revenue/',
    'revenue_by_date': '/report/revenue-by-date/',
    'revenue_by_month': '/report/revenue-by-month/',
    'revenue_by_year': '/report/revenue-by-year/',
    'revenue_by_quarter': '/report/revenue-by-quarter/',

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