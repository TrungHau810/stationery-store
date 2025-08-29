import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = " http://192.168.1.9:8000/";

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

    'cart': '/cart/',
    'add_to_cart': '/cart/add-to-cart/',
    'remove_from_cart': '/cart/remove-from-cart/',

    'my_orders': '/orders/my-orders/',
    'create_order': '/orders/',
    'order': (id) => `/orders/${id}/`,
    'order_detail': (id) => `/orders/${id}/detail/`,
    'cancel_order': (id) => `/orders/${id}/cancel/`

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