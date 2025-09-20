import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";

export const addToCart = async ({ user, product, quantity = 1, dispatchCart }) => {
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

        // Cập nhật context cart ngay lập tức
        if (dispatchCart) {
            dispatchCart({ type: "increment", payload: quantity });
        }

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


export const increaseQuantity = async (item, setCart, loadCart) => {
    try {
        setCart(prev =>
            prev.map(ci =>
                ci.product.id === item.product.id
                    ? { ...ci, quantity: ci.quantity + 1 }
                    : ci
            )
        );
        await authApis().post(endpoint["add_to_cart"], { product_id: item.product.id });
        loadCart();
    } catch (err) {
        console.error("Tăng số lượng thất bại:", err);
        loadCart();
    }
};

export const removeItem = async (item, setCart, loadCart) => {
    const result = await Swal.fire({
        icon: "warning",
        title: "Bạn có chắc chắn?",
        text: `Bạn muốn xóa "${item.product.name}" khỏi giỏ hàng?`,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
        setCart(prev => prev.filter(ci => ci.id !== item.id));
        try {
            await authApis().post(endpoint["remove_from_cart"], {
                product_id: item.product.id,
                quantity: item.quantity,
            });
            Swal.fire({
                icon: "success",
                title: "Đã xóa!",
                text: `"${item.product.name}" đã được xóa khỏi giỏ hàng.`,
                timer: 1500,
                showConfirmButton: false,
            });
            loadCart();
        } catch (err) {
            console.error("Lỗi xóa:", err);
            loadCart();
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Không thể xóa sản phẩm.",
            });
        }
    }
};

export const decreaseQty = async (item, setCart, loadCart) => {
    try {
        setCart(prev =>
            prev
                .map(ci =>
                    ci.product.id === item.product.id
                        ? { ...ci, quantity: Math.max(ci.quantity - 1, 0) }
                        : ci
                )
                .filter(ci => ci.quantity > 0)
        );
        await authApis().post(endpoint["remove_from_cart"], {
            product_id: item.product.id,
            quantity: 1,
        });
        loadCart();
    } catch (err) {
        console.error("Giảm số lượng thất bại:", err);
        loadCart();
    }
};