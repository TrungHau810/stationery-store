import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import OrderCard from "../layout/order/OrderCard";
import { LoadingSpinner } from "../layout/LoadingSpinner";
import { statusMap } from "../Purchase";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const nav = useNavigate();

    const fetchAllOrders = async (status = "ALL", pageNumber = 1) => {
        try {
            setLoading(true);
            let url = `${endpoint["get_all_orders"]}?page=${pageNumber}&page_size=${pageSize}`;
            if (status !== "ALL") url += `&status=${status}`;
            const res = await authApis().get(url);

            setOrders(res.data.results);
            setCount(res.data.count);
            setPage(pageNumber);
        } catch (err) {
            console.error("Lỗi load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders(filterStatus, 1);
    }, [filterStatus]);

    const totalPages = Math.ceil(count / pageSize);

    const getVisiblePages = (page, totalPages) => {
        const delta = 2;
        const pages = [];
        for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-600">
                        Danh sách đơn hàng
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Quản lý tất cả đơn đặt hàng của cửa hàng
                    </p>
                </div>
                <p className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    Tổng số: <span className="text-blue-600">{count}</span> đơn
                </p>
            </div>

            {/* Tabs trạng thái */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.keys(statusMap).map((key) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`px-4 py-2 whitespace-nowrap rounded-full border transition-all duration-200 
                            ${filterStatus === key
                                ? "bg-blue-500 text-white border-blue-500 shadow-sm font-semibold"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
                            }`}
                    >
                        {statusMap[key].label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-10">
                    <LoadingSpinner content="Đang tải danh sách đơn hàng..." />
                </div>
            )}

            {/* Empty state */}
            {!loading && (!Array.isArray(orders) || orders.length === 0) ? (
                <div className="flex flex-col items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg shadow p-10 text-center text-gray-600">
                    <img
                        src="/cart.png"
                        alt="No orders"
                        className="w-28 h-28 mb-4 opacity-80"
                    />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Không có đơn hàng nào phù hợp
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
                                onClick={() => fetchAllOrders(filterStatus, page - 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-blue-100 disabled:opacity-50"
                            >
                                ‹
                            </button>

                            {getVisiblePages(page, totalPages).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => fetchAllOrders(filterStatus, p)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition 
                                        ${p === page
                                            ? "bg-blue-500 text-white border-blue-500 font-semibold"
                                            : "hover:bg-blue-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                disabled={page >= totalPages}
                                onClick={() => fetchAllOrders(filterStatus, page + 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-blue-100 disabled:opacity-50"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderList;