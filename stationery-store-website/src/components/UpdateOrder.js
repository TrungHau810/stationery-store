import { useParams } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";
import { useEffect, useState } from "react";
import { statusMap } from "./Purchase";
import {
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    ClockIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    HashtagIcon,
} from "@heroicons/react/24/outline";
import { paymentMethodMap } from "./layout/order/OrderCard";
import Swal from "sweetalert2";
import { ArrowLeftIcon, TruckIcon } from "@heroicons/react/24/solid";

const UpdateOrder = () => {
    const { id } = useParams();
    const [order, setOrder] = useState({});
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false); // loading cho action
    const [fetching, setFetching] = useState(true); // loading khi load dữ liệu

    const fetchOrderDetails = async () => {
        try {
            setFetching(true);
            const orderRes = await authApis().get(endpoint["order"](id));
            const res = await authApis().get(endpoint["order_detail"](id));
            setOrder(orderRes.data);
            setDetails(res.data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setLoading(true);
            let res = await authApis().patch(endpoint["order"](id), { status: newStatus });
            if (res.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Cập nhật trạng thái đơn hàng thành công!",
                    timer: 2000,
                    showConfirmButton: false,
                });
                fetchOrderDetails();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Cập nhật trạng thái đơn hàng thất bại!",
                    text: res.data?.detail || "Vui lòng thử lại sau.",
                });
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (fetching) {
        // Hiển thị spinner toàn trang khi đang load dữ liệu ban đầu
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 relative">
            {loading && (
                <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center z-50 rounded-xl">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <HashtagIcon className="h-7 w-7" />
                    Quản lý đơn hàng #{order.id}
                </h2>
                <p className="text-sm text-blue-100 mt-1 pl-9">
                    Cập nhật thông tin & trạng thái đơn hàng
                </p>
            </div>

            {/* Thông tin đơn */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-blue-500" /> Thông tin chung
                </h3>
                <table className="w-full border-collapse text-base">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-green-500" /> Khách hàng
                            </td>
                            <td className="py-2 px-3">{order.name_customer}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <PhoneIcon className="h-5 w-5 text-purple-500" /> SĐT
                            </td>
                            <td className="py-2 px-3">{order.number_phone}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-red-500" /> Địa chỉ
                            </td>
                            <td className="py-2 px-3">{order.address}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <CreditCardIcon className="h-5 w-5 text-indigo-500" /> Thanh toán
                            </td>
                            <td className="py-2 px-3">
                                {paymentMethodMap[order.payment_method]?.label || "Không xác định"}
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-yellow-500" /> Trạng thái
                            </td>
                            <td className="py-2 px-3">
                                <span
                                    className={`px-4 py-1 rounded-full text-sm font-semibold ${statusMap[order.status]?.color || "bg-gray-200 text-gray-700"
                                        }`}
                                >
                                    {statusMap[order.status]?.label || "Không xác định"}
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td className="py-2 px-3 font-medium flex items-center gap-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-teal-500" /> Tổng tiền
                            </td>
                            <td className="py-2 px-3 text-2xl font-bold text-blue-600">
                                {Number(order.total_price).toLocaleString("vi-VN")} VND
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Sản phẩm trong đơn
                </h3>
                <table className="w-full border-collapse text-base">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3">Hình ảnh</th>
                            <th className="p-3">Tên sản phẩm</th>
                            <th className="p-3">Số lượng</th>
                            <th className="p-3">Giá</th>
                            <th className="p-3">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                    />
                                </td>
                                <td className="p-3 font-medium text-gray-800">{item.product.name}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">
                                    {Number(item.product.price).toLocaleString("vi-VN")} VND
                                </td>
                                <td className="p-3 font-bold text-blue-600">
                                    {(item.quantity * item.product.price).toLocaleString("vi-VN")} VND
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-4">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Quay lại
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    onClick={() => handleUpdateStatus("SHIPPING")}
                    disabled={loading || order.status !== "PENDING"}
                >
                    <TruckIcon className="h-5 w-5" />
                    {loading ? "Đang cập nhật..." : "Chuyển sang vận chuyển"}
                </button>
            </div>
        </div>
    );
};

export default UpdateOrder;