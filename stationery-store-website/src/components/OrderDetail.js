import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";
import { statusMap } from "./Purchase";
import { FaCreditCard, FaShoppingCart, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { LoadingSpinner } from "./layout/LoadingSpinner";

const OrderDetail = () => {
  const { id } = useParams();
  const [orderDetail, setOrderDetail] = useState([]);
  const [order, setOrder] = useState({});
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const nav = useNavigate();

  const total_price = orderDetail.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const paymentMethodMap = {
    momo: { label: "Thanh toán bằng MoMo", image: "/momo.png" },
    vnpay: { label: "Thanh toán bằng VNPay", image: "/vnpay.jpg" },
    cash: { label: "Thanh toán khi nhận hàng (COD)", image: "/cash.jpg" },
  };

  const fetchOrderDetail = async () => {
    try {
      const resDetail = await authApis().get(endpoint["order_detail"](id));
      const resOrder = await authApis().get(endpoint["order"](id));
      setOrderDetail(resDetail.data);
      setOrder(resOrder.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      Swal.fire({ icon: "error", title: "Vui lòng nhập lý do huỷ" });
      return;
    }

    try {
      await authApis().patch(endpoint["cancel_order"](id), {
        reason_cancel: cancelReason,
      });
      Swal.fire({ icon: "success", title: "Huỷ đơn hàng thành công" });
      setShowModal(false);
      fetchOrderDetail();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response?.data?.detail || "Huỷ đơn thất bại",
      });
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner content="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4 md:space-y-0 md:flex md:flex-col md:gap-3">
        {/* Hàng 1: ID đơn hàng + trạng thái */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-2xl font-bold">
            Đơn hàng <span className="text-blue-600">#{order.id}</span>
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusMap[order.status]?.color || "bg-gray-200 text-gray-700"
              }`}
          >
            {statusMap[order.status]?.label || "Không xác định"}
          </span>
        </div>

        {/* Hàng 2: Ngày đặt và ngày cập nhật */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-8 text-gray-500 text-sm">
          <span>
            Ngày đặt:{" "}
            {new Date(order.created_date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="mx-2">|</span>
          <span>
            {order.status === "CANCELED" ? "Đã huỷ:" : "Cập nhật:"}{" "}
            {new Date(order.updated_date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Hàng 3: Chú thích huỷ đơn */}
        <div className="text-gray-600 text-sm italic">
          Lưu ý: Bạn chỉ có thể huỷ đơn hàng khi chưa thanh toán
        </div>
      </div>

      {/* Grid thông tin */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin nhận hàng */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center text-red-600">
            <FaMapMarkerAlt className="mr-2" /> Thông tin nhận hàng
          </h3>
          <p><span className="font-medium">Người nhận:</span> {order.name_customer}</p>
          <p><span className="font-medium">SĐT:</span> {order.number_phone}</p>
          <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
        </div>

        {/* Hình thức thanh toán */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center text-blue-600">
            <FaCreditCard className="mr-2" /> Hình thức thanh toán
          </h3>
          {paymentMethodMap[order.payment_method] ? (
            <div className="flex items-center gap-3">
              <img
                src={paymentMethodMap[order.payment_method].image}
                alt={order.payment_method}
                className="w-12 h-12 object-contain rounded border"
              />
              <span>{paymentMethodMap[order.payment_method].label}</span>
            </div>
          ) : (
            <span className="text-gray-500">Chưa xác định</span>
          )}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center text-green-600">
          <FaShoppingCart className="mr-2" /> Thông tin sản phẩm
        </h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 border">Sản phẩm</th>
              <th className="p-2 border">Số lượng</th>
              <th className="p-2 border">Đơn giá</th>
              <th className="p-2 border">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="p-2 border flex items-center gap-2">
                  <img
                    src={item.product.image || "/placeholder.png"}
                    alt={item.product.name}
                    className="w-12 h-12 object-contain border rounded"
                  />
                  <span className="text-gray-800">{item.product.name}</span>
                </td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border text-red-600">
                  {Number(item.product.price).toLocaleString("vi-VN")}₫
                </td>
                <td className="p-2 border font-semibold">
                  {(item.quantity * item.product.price).toLocaleString("vi-VN")}₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 max-w-md ml-auto">
        <div className="grid grid-cols-[auto,minmax(100px,150px)] gap-4">
          <span>Tổng số lượng:</span>
          <span className="font-semibold text-right">
            {orderDetail.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm
          </span>
        </div>

        <div className="grid grid-cols-[auto,minmax(100px,150px)] gap-4">
          <span>Tạm tính:</span>
          <span className="font-semibold text-right">
            {Number(total_price).toLocaleString("vi-VN")}₫
          </span>
        </div>

        <div className="grid grid-cols-[auto,minmax(100px,150px)] gap-4">
          <span>Giảm giá:</span>
          <span className="font-semibold text-green-600 text-right">
            {Number(order.total_price - total_price || 0).toLocaleString("vi-VN")}₫
          </span>
        </div>

        <div className="grid grid-cols-[auto,minmax(100px,150px)] gap-4">
          <span>Điểm tích luỹ:</span>
          <span className="font-semibold text-blue-600 text-right">
            {Math.floor(order.total_price * 0.01).toLocaleString("vi-VN")} điểm
          </span>
        </div>

        <div className="grid grid-cols-[auto,minmax(100px,150px)] gap-4 text-2xl font-bold text-red-600 border-t pt-2">
          <span>Tổng tiền:</span>
          <span className="text-right">
            {Number(order.total_price).toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex flex-wrap justify-end gap-3">
        {order.status === "PENDING" && order.payment_method !== "cash" && (
          <button
            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            onClick={() =>
              nav(`/payment`, {
                state: {
                  orderId: order.id,
                  paymentMethod: order.payment_method,
                  amount: order.total_price,
                },
              })
            }
          >
            Thanh toán
          </button>
        )}
        {order.status === "PENDING" && (
          <button
            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={() => setShowModal(true)}
          >
            Huỷ đơn
          </button>
        )}
      </div>

      {/* Modal huỷ đơn */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Xác nhận huỷ đơn
            </h2>
            <textarea
              placeholder="Nhập lý do huỷ đơn..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={handleCancelOrder}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lý do huỷ */}
      {order.status === "CANCELED" && (
        <div className="bg-red-50 p-4 rounded shadow space-y-2">
          <h3 className="font-semibold text-red-600">Lý do huỷ:</h3>
          <p className="text-gray-600">
            {order.reson_cancel || "Không có lý do"}
          </p>
        </div>
      )}

      {/* Quay lại */}
      <div className="text-center">
        <button
          className="px-6 py-2 bg-orange-100 border border-orange-400 text-orange-600 rounded hover:bg-orange-200 transition"
          onClick={() => nav("/purchase")}
        >
          Về danh sách đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;