import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = "http://192.168.1.9:8000/";

export const endpoint = {
    "send_otp": "/verified/send-otp/",
    "login": "/oauth2/token/",
    "register": "/user/",
    "verify": "/user/verified/",
    "profile": "/user/profile/",

    "discounts_of_product": (id) => `/products/${id}/discounts/`,
    "discount": "/discounts/",
    "discount_detail": (id) => `/discounts/${id}/`,

    "loyalty": "/loyalty-points/my-loyalty-point/",
    "loyalty_history": "/loyalty-point-histories/",

    "category": "/categories/",

    "product": "/products/",
    "product_detail": (id) => `/products/${id}/`,
    "reviews_of_product": (id) => `/products/${id}/reviews/`,

    'cart': '/cart/',
    'add_to_cart': '/cart/add-to-cart/',
    'remove_from_cart': '/cart/remove-from-cart/',

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