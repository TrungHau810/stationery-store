import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import OrderCard from "../layout/order/OrderCard";
import { LoadingSpinner } from "../layout/LoadingSpinner";

const PendingOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5); // số đơn hàng mỗi trang
    const nav = useNavigate();

    const fetchPendingOrders = async (pageNumber = 1) => {
        try {
            setLoading(true);
            let url = `${endpoint["get_all_orders"]}?status=pending&page=${pageNumber}&page_size=${pageSize}`;
            const res = await authApis().get(url);

            setOrders(res.data.results);
            setCount(res.data.count);
            setPage(pageNumber);
        } catch (error) {
            console.error("Error fetching pending orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrders(1);
    }, []);

    const totalPages = Math.ceil(count / pageSize);

    return (
        <>
            {/* Overlay loading */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
                    <LoadingSpinner content="Đang tải đơn hàng..." />
                </div>
            )}

            <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600">
                            Đơn hàng đang chờ
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Các đơn đặt hàng chờ xác nhận hoặc xử lý
                        </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        Tổng số: <span className="text-blue-600">{count}</span> đơn
                    </span>
                </div>

                {/* Không có đơn */}
                {(!Array.isArray(orders) || orders.length === 0) && !loading ? (
                    <div className="flex flex-col items-center justify-center bg-gray-50 border rounded-lg shadow p-8 text-center text-gray-600">
                        <img
                            src="/cart.png"
                            alt="No orders"
                            className="w-24 h-24 mb-4 opacity-80"
                        />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Không có đơn hàng nào đang chờ
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Quay lại mua sắm để tạo đơn hàng mới nhé!
                        </p>
                        <button
                            onClick={() => nav("/products")}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Xem sản phẩm
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Danh sách đơn */}
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => fetchPendingOrders(page - 1)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-blue-100 disabled:opacity-50"
                                >
                                    ‹
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (p) => (
                                        <button
                                            key={p}
                                            onClick={() => fetchPendingOrders(p)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full border transition 
                                                ${p === page
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "hover:bg-blue-100"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => fetchPendingOrders(page + 1)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-blue-100 disabled:opacity-50"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default PendingOrder;