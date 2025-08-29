import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";

export const addToCart = async ({ user, product, quantity = 1 }) => {
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Chưa đăng nhập!',
            text: `Không thể thêm sản phẩm vào giỏ hàng`,
            timer: 2500,
            showConfirmButton: false
        });
        return false;
    }

    try {
        await authApis().post(endpoint['add_to_cart'], {
            product_id: product.id,
            quantity
        });

        Swal.fire({
            icon: 'success',
            title: 'Đã thêm vào giỏ hàng!',
            text: `Sản phẩm đã được thêm vào giỏ hàng`,
            timer: 2000,
            showConfirmButton: false
        });

        return true;
    } catch (error) {
        console.error("Error adding to cart:", error);
        Swal.fire({
            icon: 'error',
            title: 'Thêm giỏ hàng thất bại',
            text: error.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại',
        });
        return false;
    }
};