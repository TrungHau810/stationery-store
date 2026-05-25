import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";
import { statusMap } from "./Purchase";

import {
  FaCreditCard,
  FaMapMarkerAlt,
  FaTimes,
  FaBoxOpen,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

import { LoadingSpinner } from "./layout/LoadingSpinner";

const OrderDetail = () => {
  const { id } = useParams();

  const [orderDetail, setOrderDetail] = useState([]);
  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const nav = useNavigate();

  const total_price = orderDetail.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const paymentMethodMap = {
    momo: {
      label: "Thanh toán bằng MoMo",
      image: "/momo.png",
    },

    vnpay: {
      label: "Thanh toán bằng VNPay",
      image: "/vnpay.jpg",
    },

    cash: {
      label: "Thanh toán khi nhận hàng (COD)",
      image: "/cash.jpg",
    },
  };

  const reason_cancel = {
    no_need: "Không có nhu cầu sử dụng nữa",
    wrong_order: "Đặt nhầm sản phẩm",
    find_better_price: "Tìm được giá tốt hơn",
    no_value: "Sản phẩm không như mong đợi",
    need_voucher: "Chưa thêm mã giảm giá",
    late_delivery: "Giao hàng quá lâu",
    other: "Lý do khác",
  };

  const fetchOrderDetail = async () => {
    try {
      const resDetail = await authApis().get(
        endpoint["order_detail"](id)
      );

      const resOrder = await authApis().get(
        endpoint["order"](id)
      );

      setOrderDetail(resDetail.data);
      setOrder(resOrder.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      Swal.fire({
        icon: "error",
        title: "Vui lòng chọn lý do huỷ",
      });

      return;
    }

    if (
      cancelReason === reason_cancel.other &&
      !otherReason.trim()
    ) {
      Swal.fire({
        icon: "error",
        title: "Vui lòng nhập lý do khác",
      });

      return;
    }

    try {
      await authApis().patch(
        endpoint["cancel_order"](id),
        {
          reason_cancel: cancelReason,
          note_cancel: otherReason,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Huỷ đơn hàng thành công",
      });

      setShowModal(false);

      setCancelReason("");
      setOtherReason("");

      fetchOrderDetail();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title:
          error.response?.data?.detail ||
          "Huỷ đơn thất bại",
      });
    }
  };

  useEffect(() => {
    fetchOrderDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner content="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Đơn hàng #{order.id}
                </h1>

                <div className="flex items-center gap-2 mt-2 text-sm text-orange-100">
                  <FaCalendarAlt />

                  <span>
                    {new Date(
                      order.created_date
                    ).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`px-5 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${statusMap[order.status]?.color}`}
                >
                  {statusMap[order.status]?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-orange-50 border-t text-sm text-orange-700 flex items-center gap-2">
            <FaInfoCircle />
            Bạn chỉ có thể huỷ đơn hàng khi chưa thanh toán
          </div>
        </div>

        {/* INFO */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* SHIPPING */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Thông tin nhận hàng
                </h2>

                <p className="text-sm text-gray-500">
                  Thông tin giao hàng của khách
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">
                  Người nhận
                </p>

                <p className="font-semibold">
                  {order.name_customer}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Số điện thoại
                </p>

                <p className="font-semibold">
                  {order.number_phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Địa chỉ giao hàng
                </p>

                <p className="font-semibold">
                  {order.address}
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                <FaCreditCard />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Thanh toán
                </h2>

                <p className="text-sm text-gray-500">
                  Phương thức thanh toán
                </p>
              </div>
            </div>

            {paymentMethodMap[
              order.payment_method
            ] ? (
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border">
                <img
                  src={
                    paymentMethodMap[
                      order.payment_method
                    ].image
                  }
                  alt={order.payment_method}
                  className="w-14 h-14 object-contain rounded-lg bg-white border p-2"
                />

                <div>
                  <p className="font-semibold text-gray-800">
                    {
                      paymentMethodMap[
                        order.payment_method
                      ].label
                    }
                  </p>

                  <p className="text-sm text-gray-500">
                    Thanh toán an toàn
                  </p>
                </div>
              </div>
            ) : (
              <p>Không xác định</p>
            )}
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl">
              <FaBoxOpen />
            </div>

            <div>
              <h2 className="font-bold text-lg">
                Sản phẩm đã đặt
              </h2>

              <p className="text-sm text-gray-500">
                {orderDetail.length} sản phẩm
              </p>
            </div>
          </div>

          <div className="divide-y">
            {orderDetail.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border bg-white">
                    <img
                      src={
                        item.product.image ||
                        "/placeholder.png"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.product.name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Số lượng: {item.quantity}
                    </p>

                    <p className="text-red-500 font-bold mt-2">
                      {Number(
                        item.product.price
                      ).toLocaleString("vi-VN")}
                      ₫
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Thành tiền
                  </p>

                  <p className="text-2xl font-bold text-orange-600">
                    {(
                      item.quantity *
                      item.product.price
                    ).toLocaleString("vi-VN")}
                    ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex justify-end">
          <div className="bg-white rounded-2xl shadow-sm border p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-5">
              <FaMoneyBillWave className="text-green-600 text-xl" />

              <h2 className="font-bold text-lg">
                Tổng thanh toán
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Tổng số lượng
                </span>

                <span className="font-semibold">
                  {orderDetail.reduce(
                    (acc, i) =>
                      acc + i.quantity,
                    0
                  )}{" "}
                  sản phẩm
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Tạm tính
                </span>

                <span className="font-semibold">
                  {Number(
                    total_price
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Giảm giá
                </span>

                <span className="font-semibold text-green-600">
                  {Number(
                    order.total_price -
                    total_price || 0
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">
                  Tổng tiền
                </span>

                <span className="text-3xl font-bold text-red-600">
                  {Number(
                    order.total_price
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CANCEL REASON */}
        {order.status === "CANCELED" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h2 className="font-bold text-red-600 mb-3">
              Lý do huỷ đơn
            </h2>

            <p className="text-gray-700">
              {order.reason_cancel ||
                "Không rõ lý do huỷ đơn cụ thể của khách hàng"}
            </p>

            {order.reason_cancel ===
              reason_cancel.other &&
              order.note_cancel && (
                <div className="mt-4 bg-white rounded-xl border p-4 text-gray-700">
                  {order.note_cancel}
                </div>
              )}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-xl border bg-white hover:bg-gray-50 transition"
            onClick={() =>
              nav("/purchase")
            }
          >
            <FaArrowLeft />
            Quay lại
          </button>

          <div className="flex gap-3">
            {order.status === "PENDING" &&
              order.payment_method !==
              "cash" && (
                <button
                  className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow transition"
                  onClick={() =>
                    nav(`/payment`, {
                      state: {
                        orderId: order.id,
                        paymentMethod:
                          order.payment_method,
                        amount:
                          order.total_price,
                      },
                    })
                  }
                >
                  Thanh toán
                </button>
              )}

            {order.status === "PENDING" && (
              <button
                className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
                onClick={() =>
                  setShowModal(true)
                }
              >
                Huỷ đơn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Huỷ đơn hàng
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-white text-xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-5">
                Vui lòng chọn lý do huỷ đơn
                hàng
              </p>

              <div className="space-y-3">
                {Object.entries(
                  reason_cancel
                ).map(([key, value]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${cancelReason === value
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                      }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={value}
                      checked={
                        cancelReason === value
                      }
                      onChange={(e) =>
                        setCancelReason(
                          e.target.value
                        )
                      }
                    />

                    <span className="font-medium">
                      {value}
                    </span>
                  </label>
                ))}
              </div>

              {cancelReason ===
                reason_cancel.other && (
                  <textarea
                    placeholder="Nhập lý do khác..."
                    className="w-full border rounded-xl p-4 mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
                    rows={4}
                    value={otherReason}
                    onChange={(e) =>
                      setOtherReason(
                        e.target.value
                      )
                    }
                  />
                )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-5 py-3 rounded-xl border hover:bg-gray-100 transition"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Đóng
                </button>

                <button
                  className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                  onClick={handleCancelOrder}
                >
                  Xác nhận huỷ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;