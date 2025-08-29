import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";
import { statusMap } from "./Purchase";


const OrderDetail = () => {

    const { id } = useParams();
    const [orderDetail, setOrderDetail] = useState([]);
    const [order, setOrder] = useState({});
    const [cancelReason, setCancelReason] = useState("");
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    const fetchOrderDetail = async () => {
        try {
            let response = await authApis().get(endpoint['order_detail'](id));
            setOrderDetail(response.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchOrder = async () => {
        try {
            let response = await authApis().get(endpoint['order'](id));
            console.log("Order:", response.data);
            setOrder(response.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        }
    }

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            Swal.fire({ icon: "error", title: "Vui lòng nhập lý do huỷ" });
            return;
        }

        try {
            await authApis().patch(endpoint['cancel_order'](id), { reason: cancelReason });
            Swal.fire({ icon: "success", title: "Huỷ đơn hàng thành công" });
            fetchOrder(); // tải lại trạng thái đơn
        } catch (error) {
            console.error("Cancel order error:", error);
            Swal.fire({ icon: "error", title: error.response?.data?.detail || "Huỷ đơn thất bại" });
        }
    }

    useEffect(() => {
        fetchOrderDetail();
        fetchOrder();
    }, []);

    return (
        <div>
            <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">
                        Chi tiết đơn hàng #{order.id} -
                        <span className={`ml-2 ${statusMap[order.status]?.color || "text-gray-500"}`}>
                            {statusMap[order.status]?.label || "Không xác định"}
                        </span>
                    </h2>
                    <span className="text-sm text-gray-500">
                        Đặt lúc: {new Date(order.created_date).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })}
                    </span>
                    {order.status === "CANCELED" && (
                        <span className="text-sm text-gray-500">
                            Huỷ lúc: {new Date(order.updated_date).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </span>
                    )}
                </div>

                {/* Thông tin nhận hàng */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">📍</span> THÔNG TIN NHẬN HÀNG
                    </h3>
                    <p>Người nhận: {order.user} - {orderDetail.receiverPhone}</p>
                    <p>Địa chỉ: {orderDetail.address}</p>
                    <p>Nhận lúc: {orderDetail.deliveryTime}</p>
                </div>

                {/* Hình thức thanh toán */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">💳</span> HÌNH THỨC THANH TOÁN
                    </h3>
                    <p>{order.method}</p>
                    <p className="text-green-600">Đã thanh toán thành công {orderDetail.total}₫</p>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">🛒</span> THÔNG TIN SẢN PHẨM
                    </h3>
                    {orderDetail.map((item) => (
                        <div key={item.id} className="flex items-center mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-contain mr-4" />
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">{item.product.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Số lượng: {item.quantity}
                                </div>
                            </div>
                            <div className="font-semibold">{item.product.price}₫</div>
                        </div>
                    ))}
                </div>

                {/* Tổng tiền */}
                <div className="bg-white p-4 rounded-lg shadow mb-4 text-right space-y-1">
                    <div>Tạm tính: {orderDetail.total}₫</div>
                    <div>Tổng tiền: {orderDetail.tota}₫</div>
                    <div className="font-bold text-red-600">Số tiền đã thanh toán: {orderDetail.total}₫</div>
                </div>

                {order.status === "PENDING" && (
                    <div className="bg-red-50 p-4 rounded shadow space-y-2">
                        <h3 className="font-semibold text-red-600">Huỷ đơn hàng</h3>
                        <textarea
                            placeholder="Nhập lý do huỷ đơn..."
                            className="w-full border border-red-300 rounded px-3 py-2"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={handleCancelOrder}
                        >
                            Huỷ đơn
                        </button>
                    </div>
                )}
                {order.status === "CANCELED" && (
                    <div className="bg-red-50 p-4 rounded shadow space-y-2">
                        <h3 className="font-semibold text-red-600">Lý do huỷ:</h3>
                        <p className="text-gray-600">{order.cancel_reason || "Không có lý do"}</p>
                    </div>
                )}

                {/* Nút quay lại */}
                <div className="text-center">
                    <button className="px-6 py-2 bg-orange-50 border border-orange-400 text-orange-600 rounded hover:bg-orange-100"
                        onClick={() => nav("/purchase")}>
                        VỀ TRANG DANH SÁCH ĐƠN HÀNG
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;