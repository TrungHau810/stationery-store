import axios from "axios";
import cookie from 'react-cookies'


const BASE_URL = " http://10.17.64.105:8000/";

export const endpoint = {
    "login": "/oauth2/token/",
    "register": "/users/",
    "profile": "/users/profile",

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