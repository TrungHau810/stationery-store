import { useContext, useEffect, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";


const Purchase = () => {

    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [orders, setOrders] = useState([]);
    const [user,] = useContext(MyUserContext);

    const nav = useNavigate();

    const fetchLoyaltyPoints = async () => {
        try {
            const res = await authApis().get(endpoint["loyalty"]);
            console.log("Loyalty points:", res.data.points);
            setLoyaltyPoints(res.data);
        } catch (err) {
            console.error("Lỗi load loyalty points:", err);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const res = await authApis().get(endpoint["my_orders"]);
            console.log("My orders:", res.data);
            setOrders(res.data.results);
        } catch (err) {
            console.error("Lỗi load đơn hàng:", err);
        }
    };

    useEffect(() => {
        fetchLoyaltyPoints();
        fetchMyOrders();
        console.log("orders: ", orders);
    }, [user]);

    return (
        <>
            {!user ? (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h1 className="text-2xl font-semibold mb-4">Vui lòng đăng nhập</h1>
                        <p className="mb-6 text-gray-600">Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.</p>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => nav("/login")}>
                            Đăng nhập
                        </button>
                    </div>
                </div>

            ) : (
                <div className="max-w-6xl mx-auto p-4">
                    {user && (
                        <h3 className="text-lg font-semibold mb-4">Anh/Chị: {user.full_name}</h3>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-4">
                        {/* Cột trái: menu + điểm tích lũy */}
                        <div className="md:w-64 flex-shrink-0 bg-gray-100 p-4 rounded-lg shadow space-y-4">
                            <p className="font-semibold text-gray-700">Anh/Chị: {user.full_name}</p>

                            <div className="bg-yellow-100 p-4 rounded-lg text-center">
                                <h2 className="text-lg font-bold mb-2">Tổng điểm tích lũy</h2>
                                <p className="text-2xl font-semibold text-yellow-600">
                                    {loyaltyPoints.total_point || 0} điểm
                                </p>
                                <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={() => nav("/loyalty-point")}>Xem chi tiết</button>
                            </div>

                            {/* Các nút menu */}
                            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-200">Đơn hàng đã mua</button>
                            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-200">Thông tin & địa chỉ</button>
                            <button className="w-full text-left px-3 py-2 rounded text-red-500 border border-red-300 hover:bg-red-50">Đăng xuất</button>
                        </div>

                        {/* Cột phải: danh sách đơn hàng */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-4">Đơn hàng đã mua</h2>

                            {!Array.isArray(orders) || orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center bg-white border rounded-lg shadow p-8 text-center text-gray-600">
                                    <img
                                        src="/cart.png"
                                        alt="No orders"
                                        className="w-28 h-28 mb-4 opacity-80"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Bạn chưa có đơn hàng nào</h3>
                                    <p className="text-sm text-gray-500 mb-4">Hãy tiếp tục mua sắm để trải nghiệm dịch vụ của chúng tôi nhé!</p>
                                    <button onClick={() => nav("/")}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mua ngay</button>
                                </div>
                            ) : (
                                Array.isArray(orders) && orders.map(order => (
                                    <div key={order.id} className="bg-white border rounded-lg shadow p-4 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-700">
                                                Đơn hàng: <span className="font-normal">#{order.id}</span>
                                            </span>
                                            <span className={`font-semibold ${statusMap[order.status]?.color || "text-gray-500"}`}>
                                                {statusMap[order.status]?.label || "Không xác định"}
                                            </span>
                                        </div>

                                        <div className="text-gray-500 text-sm mb-4">
                                            Ngày đặt: {new Date(order.created_date).toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>

                                        <div className="flex items-center mb-4">
                                            <img src={order.image || "https://via.placeholder.com/60"} alt={order.name} className="w-16 h-16 object-contain mr-4" />
                                            <div>
                                                <div className="font-medium text-gray-800">{order.name}</div>
                                                <div className="text-gray-600 mt-1">
                                                    Tổng tiền: <span className="font-semibold text-gray-900">
                                                        {(Number(order.total_price) || 0).toLocaleString("vi-VN")}₫
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50"
                                            onClick={() => nav(`/purchase/order/${order.id}`)}>
                                            Xem chi tiết
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Purchase;
export const statusMap = {
    PENDING: { label: "Đã đặt hàng - Đang chờ xử lý", color: "text-yellow-600" },
    PAID: { label: "Đã thanh toán", color: "text-blue-600" },
    SHIPPING: { label: "Đang giao hàng", color: "text-gray-500" },
    DELIVERED: { label: "Đã giao hàng", color: "text-green-600" },
    CANCELED: { label: "Đã hủy", color: "text-red-600" },
};