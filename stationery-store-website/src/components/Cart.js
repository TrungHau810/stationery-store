import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import Apis, { authApis, endpoint } from "../configs/Apis";
import { MyCartContext, MyUserContext } from "../configs/Contexts";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { decreaseQty, increaseQuantity, removeItem } from "../utils/Cart";
import { LoadingSpinner } from "./layout/LoadingSpinner";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [, dispatchCart] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [loyaltyPoint, setLoyaltyPoint] = useState({});
    const [discountByVoucher, setDiscountByVoucher] = useState(0);
    const [allVouchers, setAllVouchers] = useState([]);

    const discountByPoint = Math.floor(loyaltyPoint.total_point / 1000) * 1000;

    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [address, setAddress] = useState("");

    const nav = useNavigate();

    const paymentMethods = [
        { value: "cash", label: "Thanh toán khi nhận hàng (COD)", logo: "/cash.jpg" },
        { value: "momo", label: "Thanh toán trực tuyến Momo", logo: "/momo.png" },
        { value: "vnpay", label: "Thanh toán trực tuyến VNPAY", logo: "/vnpay.jpg" },
    ];

    // Load cart
    const loadCart = async () => {
        try {
            setDataLoading(true);
            const res = await authApis().get(endpoint["cart"]);
            const items = res.data?.[0]?.items || [];
            setCart(items);
            const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
            dispatchCart({ type: "update", payload: totalQty });
        } catch (err) {
            console.error(err);
        } finally {
            setDataLoading(false);
        }
    };

    // Fetch all vouchers
    const fetchAllVouchers = async () => {
        try {
            const res = await Apis.get(endpoint["discount"]);
            setAllVouchers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch loyalty points
    const fetchLoyaltyPoints = async () => {
        try {
            setDataLoading(true);
            const res = await authApis().get(endpoint['loyalty']);
            setLoyaltyPoint(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setDataLoading(false);
        }
    };

    // Apply voucher (khi chọn trong dropdown)
    const handleApplyVoucher = (voucherId) => {
        const voucher = allVouchers.find(v => v.id === parseInt(voucherId));
        console.log("Applying voucher:", voucher);
        if (!voucher) return setAppliedVoucher(null);

        const isApplicable = cart.some(item =>
            voucher.products.some(p => p.id === item.product.id)
        );

        if (!isApplicable) {
            Swal.fire({
                icon: "error",
                title: "Không thể áp dụng voucher",
                text: "Không có sản phẩm nào trong giỏ đủ điều kiện áp dụng voucher này.",
            });
            setAppliedVoucher(null);
            return;
        }
        setAppliedVoucher(voucher);
        Swal.fire({
            icon: "success",
            title: "Áp dụng thành công",
            text: `Voucher "${voucher.code}" đã được áp dụng.`,
            timer: 1500
        });
    };

    // Theo dõi giỏ hàng + voucher
    useEffect(() => {
        if (appliedVoucher) {
            const eligibleItems = cart.filter(item =>
                appliedVoucher.products.some(p => p.id === item.product.id)
            );

            if (eligibleItems.length === 0) {
                // Không còn sản phẩm phù hợp => hủy voucher
                setAppliedVoucher(null);
                setDiscountByVoucher(0);
                Swal.fire({
                    icon: "info",
                    title: "Voucher đã bị hủy",
                    text: "Giỏ hàng không còn sản phẩm nào đủ điều kiện áp dụng voucher này.",
                    timer: 2000
                });
                return;
            }

            const eligibleTotal = eligibleItems.reduce(
                (sum, item) => sum + item.quantity * parseFloat(item.product.price),
                0
            );
            setDiscountByVoucher((appliedVoucher.discount / 100) * eligibleTotal);
        } else {
            setDiscountByVoucher(0);
        }
    }, [appliedVoucher, cart]);

    useEffect(() => {
        if (user) {
            loadCart();
            fetchLoyaltyPoints();
            setReceiverName(user.full_name || "");
            setReceiverPhone(user.number_phone || "");
            setAddress(user.address || "");
        }
    }, [user]);

    useEffect(() => {
        fetchAllVouchers();
    }, []);

    // Đặt hàng
    const handleConfirmOrder = async () => {
        if (!receiverName || !receiverPhone || !address) {
            Swal.fire({ icon: "error", title: "Thiếu thông tin", text: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng." });
            return;
        }

        try {
            setLoading(true);
            const response = await authApis().post(endpoint["create_order"], {
                order_details: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
                discount: appliedVoucher?.id || null,
                payment_method: paymentMethod,
                name_customer: receiverName,
                number_phone: receiverPhone,
                address,
            });

            if (response.status === 201) {
                Swal.fire({ icon: "success", title: "Đặt hàng thành công" }).then(async () => {
                    await authApis().post(endpoint["clear_cart"]);
                    setCart([]);
                    dispatchCart({ type: "update", payload: 0 });
                    if (paymentMethod === "cash") return nav("/purchase/orders/" + response.data.id);
                    nav("/payment", { state: { orderId: response.data.id, paymentMethod, amount: totalAmount } });
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Lỗi đặt hàng" });
        } finally {
            setLoading(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
    const totalAmount = total - discountByPoint - discountByVoucher;

    return (
        <div className="bg-gray-50 pb-6 pt-4">
            {dataLoading ? <LoadingSpinner content="Đang tải giỏ hàng..." /> : null}

            {cart.length === 0 ? (
                user ? (
                    <>
                        <div className="flex flex-col items-center justify-center text-center mt-5">
                            <img src="/empty-cart.png" className="w-48 h-48 mb-6 opacity-80" />
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
                            <p className="text-gray-500 mb-4">Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm</p>
                            <Link to="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center mt-5">
                        <img src="/empty-cart.png" className="w-48 h-48 mb-6 opacity-80" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để sử dụng chức năng giỏ hàng</p>
                        <Link to="/login" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition">
                            Đăng nhập ngay
                        </Link>
                    </div>
                )
            ) : (
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Thông tin nhận hàng */}
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Thông tin nhận hàng</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input placeholder="Họ tên" className="border rounded-lg px-3 py-2" value={receiverName} onChange={e => setReceiverName(e.target.value)} />
                            <input placeholder="Số điện thoại" className="border rounded-lg px-3 py-2" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} />
                            <textarea placeholder="Địa chỉ nhận hàng" className="border rounded-lg px-3 py-2" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                    </div>

                    {/* Giỏ hàng */}
                    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h2>
                        {cart.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
                                <div className="relative w-28 h-28">
                                    <img src={item.product.image} className="w-full h-full object-cover rounded-lg" />
                                    {appliedVoucher && item.product.discount?.some(d => d.id === appliedVoucher.id) && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">-{appliedVoucher.discount}%</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{item.product.name}</h3>
                                    <p className="text-gray-500">{parseFloat(item.product.price).toLocaleString()} đ</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => decreaseQty(item, setCart, loadCart)} className="w-8 h-8 flex items-center justify-center border rounded-full"><MinusIcon className="h-5 w-5" /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => increaseQuantity(item, setCart, loadCart)} className="w-8 h-8 flex items-center justify-center border rounded-full"><PlusIcon className="h-5 w-5" /></button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{(parseFloat(item.product.price) * item.quantity).toLocaleString()} đ</p>
                                    <button onClick={() => removeItem(item, setCart, loadCart)} className="text-red-500 mt-2 inline-flex items-center gap-1"><TrashIcon className="h-5 w-5" /> Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Voucher */}
                    <div className="bg-green-50 p-4 rounded-xl shadow border border-green-200 max-w-md">
                        <h3 className="text-lg font-bold mb-2">Chọn voucher</h3>
                        <select className="border rounded-lg p-2 w-full" onChange={e => handleApplyVoucher(e.target.value)} value={appliedVoucher?.id || ""}>
                            <option value="">-- Chọn voucher --</option>
                            {allVouchers.map(v => (
                                <option key={v.id} value={v.id}>Mã giảm giá {v.code} - Giảm ngay {v.discount}%</option>
                            ))}
                        </select>
                    </div>

                    {/* Thanh toán + Tổng cộng */}
                    <div className="bg-white p-6 rounded-2xl shadow max-w-6xl mx-auto flex flex-col sm:flex-row gap-6">
                        {/* Hình thức thanh toán */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow">
                            <h3 className="text-lg font-bold mb-4">Hình thức thanh toán</h3>
                            <div className="flex flex-col gap-3">
                                {paymentMethods.map(pm => (
                                    <label key={pm.value} className="flex items-center gap-3 cursor-pointer border rounded-lg p-3 hover:bg-gray-50 transition">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={pm.value}
                                            checked={paymentMethod === pm.value}
                                            onChange={() => setPaymentMethod(pm.value)}
                                            className="form-radio h-4 w-4"
                                        />
                                        <img src={pm.logo} alt={pm.label} className="w-8 h-8 object-contain" />
                                        <span className="text-gray-700">{pm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tổng cộng */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow space-y-3 border border-gray-100">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính:</span><span>{total.toLocaleString()} đ</span></div>
                            <div className="flex justify-between text-gray-600"><span>Dùng điểm:</span><span>- {discountByPoint.toLocaleString()} đ</span></div>
                            <div className="flex justify-between text-gray-600"><span>Voucher:</span><span>- {discountByVoucher.toLocaleString()} đ</span></div>
                            <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-3"><span>Tổng thanh toán:</span><span>{totalAmount.toLocaleString()} đ</span></div>
                            <button
                                disabled={loading}
                                onClick={handleConfirmOrder}
                                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
                            >
                                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;