import { useEffect, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { LoadingSpinner } from "./layout/LoadingSpinner";
import { AiOutlineTag } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoint["discount"]);
      setVouchers(res.data);
    } catch (err) {
      console.error("Lỗi load vouchers:", err);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Các mã giảm giá
      </h2>

      {loading ? (
        <LoadingSpinner content="Đang tải voucher..." />
      ) : vouchers.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          <p className="text-lg">Hiện chưa có voucher nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {vouchers.map((v) => {
            const expired = isExpired(v.end_date);

            return (
              <div
                key={v.id}
                className="relative bg-white p-5 rounded-2xl shadow-md border border-dashed border-blue-400 hover:shadow-lg transition"
              >
                {/* Icon */}
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-2 rounded-full shadow-md">
                  <AiOutlineTag size={20} />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {v.code}
                  </h3>
                  <span className="text-green-600 font-semibold text-xl">
                    -{v.discount}%
                  </span>
                </div>

                {/* Dates */}
                <p className="text-gray-500 text-sm mb-2">
                  {formatDate(v.start_date)} → {formatDate(v.end_date)}
                </p>

                {/* Trạng thái */}
                <span
                  className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${expired
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                    }`}
                >
                  {expired ? "Hết hạn" : "Còn hiệu lực"}
                </span>

                {/* Action */}
                <button
                  className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  onClick={() => {
                    nav(`/vouchers/${v.id}`);
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VoucherList;