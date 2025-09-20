import { useContext, useEffect, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import OrderCard from "./layout/order/OrderCard";
import { LoadingSpinner } from "./layout/LoadingSpinner";

export const statusMap = {
    PENDING: { label: "Đã đặt hàng - Đang chờ xử lý", color: "text-yellow-600" },
    PAID: { label: "Đã thanh toán", color: "text-blue-600" },
    SHIPPING: { label: "Đang giao hàng", color: "text-gray-500" },
    DELIVERED: { label: "Đã giao hàng", color: "text-green-600" },
    CANCELED: { label: "Đã hủy", color: "text-red-600" },
};

const Purchase = () => {
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [user] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const fetchLoyaltyPoints = async () => {
        try {
            const res = await authApis().get(endpoint["loyalty"]);
            setLoyaltyPoints(res.data);
        } catch (err) {
            console.error("Lỗi load loyalty points:", err);
        }
    };

    const fetchMyOrders = async (status = "ALL", pageNumber = 1, append = false) => {
        try {
            setLoading(true);
            let url = endpoint["my_orders"] + `?page=${pageNumber}`;
            if (status !== "ALL") url += `&status=${status}`;
            const res = await authApis().get(url);
            setOrders(prev => append ? [...prev, ...res.data.results] : res.data.results);
            setTotalPages(
                res.data.results.length > 0
                    ? Math.ceil(res.data.count / res.data.results.length)
                    : 1
            );
            setPage(pageNumber);
        } catch (err) {
            console.error("Lỗi load đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchMyOrders(filterStatus, 1, false);
        fetchLoyaltyPoints();
    }, [user, filterStatus]);

    return (
        <>
            {/* Overlay Loading */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
                    <LoadingSpinner content="Đang tải đơn hàng..." />
                </div>
            )}

            {!user ? (
                <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h1 className="text-2xl font-semibold mb-4">Vui lòng đăng nhập</h1>
                        <p className="mb-6 text-gray-600">
                            Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.
                        </p>
                        <button
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => nav("/login")}
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto p-4">
                    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-4">
                        {/* Cột trái */}
                        <div className="md:w-64 flex-shrink-0 bg-gray-100 p-4 rounded-lg shadow space-y-4">
                            <p className="font-semibold text-gray-700">
                                Anh/Chị: {user.full_name}
                            </p>

                            <div className="bg-yellow-100 p-4 rounded-lg text-center">
                                <h2 className="text-lg font-bold mb-2">Tổng điểm tích lũy</h2>
                                <p className="text-2xl font-semibold text-yellow-600">
                                    {loyaltyPoints.total_point || 0} điểm
                                </p>
                                <button
                                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={() => nav("/loyalty-point")}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Lịch sử mua hàng</h2>
                                <div className="relative inline-block w-64">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        <option value="ALL">Tất cả</option>
                                        {Object.keys(statusMap).map((key) => (
                                            <option key={key} value={key}>
                                                {statusMap[key].label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Mũi tên custom */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg
                                            className="fill-current h-4 w-4"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M5.516 7.548l4.484 4.482 4.484-4.482L16 9l-6 6-6-6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Không có đơn hàng */}
                            {(!Array.isArray(orders) || orders.length === 0) && !loading ? (
                                <div className="flex flex-col items-center justify-center bg-white border rounded-lg shadow p-8 text-center text-gray-600">
                                    <img
                                        src="/cart.png"
                                        alt="No orders"
                                        className="w-28 h-28 mb-4 opacity-80"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Rất tiếc, không tìm thấy đơn hàng nào phù hợp
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Hãy tiếp tục mua sắm để trải nghiệm dịch vụ của chúng tôi nhé!
                                    </p>
                                    <button
                                        onClick={() => nav("/")}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {orders && orders.length > 0
                                        ? orders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))
                                        : null}

                                    {/* Xem thêm */}
                                    {page <= totalPages && orders?.length > 0 && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                onClick={() =>
                                                    fetchMyOrders(
                                                        filterStatus,
                                                        page + 1,
                                                        true
                                                    )
                                                }
                                                disabled={loading}
                                            >
                                                {loading ? "Đang tải..." : "Xem thêm"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Purchase;