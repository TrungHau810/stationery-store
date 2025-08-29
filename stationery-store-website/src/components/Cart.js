import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyCartContext, MyUserContext } from "../configs/Contexts";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [, dispatchCart] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext);
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // danh sách phương thức thanh toán
    const paymentMethods = [
        {
            value: "cash",
            label: "Thanh toán khi nhận hàng (COD)",
            logo: "/cash.jpg",
        },
        {
            value: "momo",
            label: "Thanh toán trực tuyến Momo",
            logo: "/momo.png",
        },
        {
            value: "vnpay",
            label: "Thanh toán trực tuyến VNPAY",
            logo: "/vnpay.jpg",
        },
    ];

    // Load giỏ hàng từ server
    const loadCart = async () => {
        try {
            let response = await authApis().get(endpoint["cart"]);
            if (response.data && response.data[0] && response.data[0].items) {
                setCart(response.data[0].items);
            }
        } catch (error) {
            console.error("Failed to load cart:", error);
        }
    };

    // Tăng số lượng
    const increaseQuantity = async (item) => {
        try {
            setCart((prevCart) =>
                prevCart.map((ci) =>
                    ci.product.id === item.product.id
                        ? { ...ci, quantity: ci.quantity + 1 }
                        : ci
                )
            );
            await authApis().post(endpoint["add_to_cart"], { product_id: item.product.id });
        } catch (error) {
            console.error("Tăng số lượng thất bại:", error);
            loadCart();
        }
    };

    // Giảm số lượng
    const decreaseQty = async (item) => {
        try {
            setCart((prevCart) =>
                prevCart
                    .map((ci) =>
                        ci.product.id === item.product.id
                            ? { ...ci, quantity: Math.max(ci.quantity - 1, 0) }
                            : ci
                    )
                    .filter((ci) => ci.quantity > 0)
            );
            await authApis().post(endpoint["remove_from_cart"], {
                product_id: item.product.id,
                quantity: 1,
            });
        } catch (error) {
            console.error("Giảm số lượng thất bại:", error);
            loadCart();
        }
    };

    // Xóa sản phẩm có confirm
    const removeItem = async (item) => {
        const result = await Swal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn muốn xóa "${item.product.name}" khỏi giỏ hàng?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            setCart((prevCart) => prevCart.filter((ci) => ci.id !== item.id));

            try {
                await authApis().post(endpoint["remove_from_cart"], {
                    product_id: item.product.id,
                    quantity: item.quantity,
                });

                Swal.fire({
                    icon: "success",
                    title: "Đã xóa!",
                    text: `"${item.product.name}" đã được xóa khỏi giỏ hàng.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (err) {
                console.error("Lỗi xóa:", err);
                loadCart();

                Swal.fire({
                    icon: "error",
                    title: "Lỗi",
                    text: "Không thể xóa sản phẩm. Vui lòng thử lại!",
                });
            }
        }
    };

    const handleOrder = async () => {
        try {
            let response = await authApis().post(endpoint["create_order"], {
                order_details: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
                payment_method: paymentMethod, // gửi kèm phương thức thanh toán
            });

            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Đặt hàng thành công",
                    text: "Cảm ơn bạn đã đặt hàng!",
                });
            }

        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            Swal.fire({
                icon: "error",
                title: "Lỗi trong quá trình đặt hàng",
                text: error.response?.data || "Không thể đặt hàng. Vui lòng thử lại!",
            });
        }
    };

    // Tổng tiền
    const total = cart.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
    );

    useEffect(() => {
        if (user) loadCart();
    }, [user]);

    useEffect(() => {
        dispatchCart({ type: "update", payload: cart });
    }, [cart]);

    return (
        <>
            {user ? (
                <div className="min-h-screen bg-gray-100 p-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h2>

                        {cart.length === 0 ? (
                            <>
                                <img
                                    src="/empty-cart.png"
                                    alt="Empty Cart"
                                    className="w-48 h-48 mb-6 opacity-80"
                                />
                                <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
                                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                                    <Link to="/">Tiếp tục mua sắm</Link>
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 border-b pb-4"
                                    >
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">
                                                {item.product.name}
                                            </h3>
                                            <p className="text-gray-500">
                                                {parseFloat(item.product.price).toLocaleString()} đ
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => decreaseQty(item)}
                                                    className="p-1 border rounded hover:bg-gray-100"
                                                >
                                                    <MinusIcon className="h-4 w-4" />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => increaseQuantity(item)}
                                                    className="p-1 border rounded hover:bg-gray-100"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="font-semibold">
                                                {(
                                                    parseFloat(item.product.price) * item.quantity
                                                ).toLocaleString()}{" "}
                                                đ
                                            </p>
                                            <button
                                                onClick={() => removeItem(item)}
                                                className="text-red-500 hover:text-red-700 mt-2 flex items-center gap-1"
                                            >
                                                <TrashIcon className="h-4 w-4" /> Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Tổng cộng */}
                                <div className="flex justify-between items-center mt-6">
                                    <span className="text-lg font-bold">Tổng cộng:</span>
                                    <span className="text-xl font-bold text-red-600">
                                        {total.toLocaleString()} đ
                                    </span>
                                </div>

                                {/* Hình thức thanh toán */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold mb-3">
                                        Hình thức thanh toán
                                    </h3>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method.value}
                                                className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition
                        ${paymentMethod === method.value
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-gray-300"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.value}
                                                    checked={paymentMethod === method.value}
                                                    onChange={(e) =>
                                                        setPaymentMethod(e.target.value)
                                                    }
                                                    className="text-green-500 focus:ring-green-500"
                                                />
                                                <img
                                                    src={method.logo}
                                                    alt={method.label}
                                                    className="w-8 h-8 object-contain"
                                                />
                                                <span className="text-gray-700">{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Nút thanh toán */}
                                <button
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg mt-4 hover:bg-blue-600 transition"
                                    onClick={handleOrder}
                                >
                                    Đặt hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
                    <img
                        src="/empty-cart.png"
                        alt="Empty Cart"
                        className="w-48 h-48 mb-6 opacity-80"
                    />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Giỏ hàng của bạn đang trống
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Vui lòng đăng nhập để tiếp tục mua sắm
                    </p>
                    <a
                        href="/login"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Đăng nhập ngay
                    </a>
                </div>
            )}
        </>
    );
};

export default Cart;