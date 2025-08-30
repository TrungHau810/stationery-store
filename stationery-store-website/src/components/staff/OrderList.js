import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import OrderDetail from "../OrderDetail";
import { statusMap } from "../Purchase";
import { useNavigate } from "react-router-dom";


const OrderList = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    const fetchAllOrders = async () => {
        try {
            const res = await authApis().get(endpoint["get_all_orders"]);
            console.log(res.data);
            setOrders(res.data);
        } catch (err) {
            console.error("Lỗi load orders:", err);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    return (
        <>
            <div>
                <h2>Danh sách đơn hàng</h2>
            </div>
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
        </>
    );
};

export default OrderList;