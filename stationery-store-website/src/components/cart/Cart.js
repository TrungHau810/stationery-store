import { useContext, useEffect, useState } from "react";
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import Apis, { endpoint } from "../../configs/Apis";
// import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const [cart, dispatch] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const res = await Apis.get(endpoint["cart"](user.id));
                setCartItems(res.data);
            } catch (err) {
                console.error("Lỗi fetch cart items:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [user]);

    const handleQuantityChange = (productId, newQuantity) => {
        dispatch({
            type: "update",
            payload: { productId, quantity: newQuantity },
        });
    };

    const handleRemoveFromCart = (productId) => {
        dispatch({ type: "remove", payload: productId });
    };

    const handleCheckout = () => {
        nav("/checkout");
    };

    const subTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn</h1>

            {loading ? (
                <p>Loading...</p>
            ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <img src="/empty-cart.png" alt="Empty cart" className="mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        Giỏ hàng của bạn còn trống
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Hãy thêm một ít sản phẩm vào giỏ hàng nào!
                    </p>
                    <button
                        onClick={() => nav("/")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Danh sách sản phẩm trong giỏ hàng */}
                        <div className="col-span-2">
                            {cartItems.map((item) => (
                                // <CartItem
                                //     key={item.productId}
                                //     item={item}
                                //     onQuantityChange={handleQuantityChange}
                                //     onRemove={handleRemoveFromCart}
                                // />
                                <p>TEST NEF</p>
                            ))}
                        </div>

                        {/* Tổng tiền */}
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold mb-4">
                                Tóm tắt đơn hàng
                            </h2>
                            <div className="flex justify-between mb-2">
                                <span>Tổng phụ:</span>
                                <span className="font-semibold">
                                    {subTotal.toLocaleString("vi-VN")}₫
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Giảm giá:</span>
                                <span className="font-semibold text-red-500">
                                    -0₫
                                </span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span className="font-bold">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {subTotal.toLocaleString("vi-VN")}₫
                                </span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;