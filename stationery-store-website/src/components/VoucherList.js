import { useEffect, useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import { LoadingSpinner } from "./layout/LoadingSpinner";
import { AiOutlineTag } from "react-icons/ai";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await Apis.get(endpoint["discount"]);
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  const getStatus = (v) => {
    const now = new Date();
    if (now < new Date(v.start_date)) return "coming";
    if (now > new Date(v.end_date)) return "expired";
    return "active";
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  const statusStyle = {
    active: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-600",
    coming: "bg-yellow-100 text-yellow-700",
  };

  const statusText = {
    active: "Đang áp dụng",
    expired: "Hết hạn",
    coming: "Sắp áp dụng",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      <h2 className="text-2xl font-bold text-center text-gray-800">
        Mã giảm giá
      </h2>

      {loading ? (
        <LoadingSpinner content="Đang tải voucher..." />
      ) : vouchers.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Không có voucher nào
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">

          {vouchers.map((v) => {
            const status = getStatus(v);

            return (
              <div
                key={v.id}
                className="relative bg-white border border-dashed border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
              >

                {/* ICON */}
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-2 rounded-full shadow">
                  <AiOutlineTag size={18} />
                </div>

                {/* HEADER */}
                <div className="flex justify-between items-center mb-2">

                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {v.code}
                    </h3>

                    <button
                      onClick={() => copyCode(v.code)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <FiCopy />
                    </button>
                  </div>

                  <span className="text-xl font-bold text-red-500">
                    -{v.discount}%
                  </span>

                </div>

                {/* DATE */}
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(v.start_date)} → {formatDate(v.end_date)}
                </p>

                {/* STATUS */}
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${statusStyle[status]}`}
                >
                  {statusText[status]}
                </span>

                {/* ACTION */}
                <button
                  onClick={() => nav(`/vouchers/${v.id}`)}
                  className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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