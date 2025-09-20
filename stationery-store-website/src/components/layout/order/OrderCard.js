import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaBox } from "react-icons/fa";
import { useContext } from "react";
import { MyUserContext } from "../../../configs/Contexts";
import { statusMap } from "../../Purchase";

 export const paymentMethodMap = {
  momo: { label: "MoMo", color: "bg-purple-100 text-purple-800" },
  vnpay: { label: "VNPay", color: "bg-blue-100 text-blue-800" },
  cash: { label: "COD", color: "bg-gray-100 text-gray-800" },
};

const OrderCard = ({ order }) => {
  const [user] = useContext(MyUserContext);
  const nav = useNavigate();

  return (
    <div className="bg-white border rounded-lg shadow p-4 mb-4 hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700">
          Đơn hàng: <span className="font-normal">#{order.id}</span>
        </span>
        <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusMap[order.status]?.color || "bg-gray-200 text-gray-700"}`}>
          {statusMap[order.status]?.label || "Không xác định"}
        </span>
      </div>

      <div className="text-gray-500 text-sm mb-4">
        Ngày đặt: {new Date(order.created_date).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      <div className="flex items-center mb-4">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border mr-4">
          <FaBox className="text-gray-400 w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">Người nhận: {order.name_customer}</div>
          <div className="text-gray-600 mt-1">
            Tổng tiền: <span className="font-bold text-red-600">{Number(order.total_price).toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="mt-1 flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${paymentMethodMap[order.payment_method]?.color || "bg-gray-100 text-gray-800"}`}>
              <FaCreditCard className="inline mr-1" /> {paymentMethodMap[order.payment_method]?.label}
            </span>
          </div>
        </div>
      </div>

      <button
        className="flex items-center justify-center px-4 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 hover:text-orange-600 transition duration-200"
        onClick={() => {
          if (user.role === "manager") {
            nav(`/manager/orders/pending/${order.id}`);
          } else if (user.role === "staff") {
            nav(`/staff/orders/pending/${order.id}`);
          } else {
            nav(`/purchase/orders/${order.id}`);
          }
        }}
      >
        {user.role === "manager" || user.role === "staff" ? "Xem chi tiết & Cập nhật" : "Xem chi tiết"}
      </button>
    </div>
  );
};

export default OrderCard;