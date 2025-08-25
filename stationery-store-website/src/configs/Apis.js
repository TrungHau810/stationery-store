import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = " http://10.17.64.184:8000/";

export const endpoint = {
    "login": "/oauth2/token/",
    "register": "/users/",
    "profile": "/users/profile",

    "loyalty": "/loyalty-points/my-loyalty-point/",
    "loyalty_history": "/loyalty-point-histories/",

    "category": "/categories/",

    "product": "/products/",
    "product_detail": (id) => `/products/${id}/`,
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