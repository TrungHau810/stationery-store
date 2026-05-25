import { useContext, useEffect, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import OrderCard from "./layout/order/OrderCard";
import { LoadingSpinner } from "./layout/LoadingSpinner";

import {
    FiUser,
    FiGift,
    FiChevronDown,
    FiShoppingBag,
    FiLogIn,
} from "react-icons/fi";

export const statusMap = {
    PENDING: {
        label: "Chờ thanh toán",
        color: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    },

    PROCESSING: {
        label: "Đang xử lý",
        color: "bg-blue-100 text-blue-700 border border-blue-200",
    },

    SHIPPING: {
        label: "Đang giao",
        color: "bg-purple-100 text-purple-700 border border-purple-200",
    },

    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-700 border border-green-200",
    },

    CANCELED: {
        label: "Đã huỷ",
        color: "bg-red-100 text-red-700 border border-red-200",
    },
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

    const fetchMyOrders = async (
        status = "ALL",
        pageNumber = 1,
        append = false
    ) => {
        try {
            setLoading(true);

            let url = endpoint["my_orders"] + `?page=${pageNumber}`;

            if (status !== "ALL") url += `&status=${status}`;

            const res = await authApis().get(url);

            setOrders((prev) =>
                append ? [...prev, ...res.data.results] : res.data.results
            );

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
        <div className="min-h-screen bg-gray-50">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <LoadingSpinner content="Đang tải đơn hàng..." />
                </div>
            )}

            {!user ? (
                <div className="flex items-center justify-center min-h-screen p-6">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                            <FiLogIn className="text-3xl text-blue-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-3">
                            Vui lòng đăng nhập
                        </h1>

                        <p className="text-gray-500 mb-6">
                            Bạn cần đăng nhập để xem lịch sử mua hàng.
                        </p>

                        <button
                            onClick={() => nav("/login")}
                            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                        {/* Sidebar */}
                        <div className="space-y-5">
                            {/* User Card */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                        <FiUser className="text-2xl text-blue-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Khách hàng
                                        </p>

                                        <h2 className="font-semibold text-gray-800">
                                            {user.full_name}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* Loyalty */}
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-lg p-5 text-white">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm opacity-90">
                                            Điểm tích luỹ
                                        </p>

                                        <h2 className="text-3xl font-bold mt-1">
                                            {loyaltyPoints.total_point || 0}
                                        </h2>
                                    </div>

                                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <FiGift className="text-2xl" />
                                    </div>
                                </div>

                                <button
                                    onClick={() => nav("/loyalty-point")}
                                    className="w-full bg-white text-orange-500 font-semibold py-3 rounded-2xl hover:bg-orange-50 transition"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div>
                            {/* Header */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                            <FiShoppingBag className="text-indigo-600 text-xl" />
                                        </div>

                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800">
                                                Lịch sử mua hàng
                                            </h1>

                                            <p className="text-sm text-gray-500">
                                                Theo dõi đơn hàng của bạn
                                            </p>
                                        </div>
                                    </div>

                                    {/* Filter */}
                                    <div className="relative w-full md:w-64">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                            className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ALL">
                                                Tất cả trạng thái
                                            </option>

                                            {Object.keys(statusMap).map((key) => (
                                                <option key={key} value={key}>
                                                    {statusMap[key].label}
                                                </option>
                                            ))}
                                        </select>

                                        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Empty */}
                            {(!Array.isArray(orders) ||
                                orders.length === 0) &&
                                !loading && (
                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 px-6 text-center">
                                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
                                            <FiShoppingBag className="text-4xl text-gray-400" />
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            Không có đơn hàng nào
                                        </h3>

                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                            Hiện chưa có đơn hàng phù hợp với bộ
                                            lọc đã chọn.
                                        </p>

                                        <button
                                            onClick={() => nav("/")}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
                                        >
                                            Mua sắm ngay
                                        </button>
                                    </div>
                                )}

                            {/* Orders */}
                            <div className="space-y-4">
                                {orders &&
                                    orders.length > 0 &&
                                    orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                        />
                                    ))}
                            </div>

                            {/* Load More */}
                            {page < totalPages && orders?.length > 0 && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={() =>
                                            fetchMyOrders(
                                                filterStatus,
                                                page + 1,
                                                true
                                            )
                                        }
                                        disabled={loading}
                                        className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Đang tải..."
                                            : "Xem thêm đơn hàng"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchase;