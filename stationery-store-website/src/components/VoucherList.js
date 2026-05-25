import { useEffect, useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import { LoadingSpinner } from "./layout/LoadingSpinner";

import {
  FiCopy,
  FiArrowRight,
  FiCalendar,
  FiPercent,
} from "react-icons/fi";

import { HiOutlineTicket } from "react-icons/hi";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

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

  const statusText = {
    active: "Đang áp dụng",
    expired: "Hết hạn",
    coming: "Sắp áp dụng",
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);

    toast.success(`Đã sao chép mã ${code}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-[32px] p-8 md:p-10 text-white shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <HiOutlineTicket className="text-4xl" />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                Mã giảm giá
              </h1>

              <p className="text-white/80 mt-1">
                Khám phá ưu đãi dành riêng cho bạn
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner content="Đang tải voucher..." />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 mx-auto flex items-center justify-center mb-5">
              <HiOutlineTicket className="text-4xl text-gray-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không có voucher nào
            </h3>

            <p className="text-gray-500">
              Hiện chưa có chương trình khuyến mãi
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vouchers.map((v) => {
              const status = getStatus(v);

              return (
                <div
                  key={v.id}
                  className="group relative overflow-hidden bg-white rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* TOP */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                            <FiPercent className="text-xl" />
                          </div>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium backdrop-blur-md
                                                        ${status === "active"
                                ? "bg-green-400/20 text-green-100"
                                : status ===
                                  "expired"
                                  ? "bg-red-400/20 text-red-100"
                                  : "bg-yellow-400/20 text-yellow-100"
                              }`}
                          >
                            {statusText[status]}
                          </span>
                        </div>

                        <h2 className="text-3xl font-bold">
                          -{v.discount}%
                        </h2>

                        <p className="text-white/80 mt-1">
                          Giảm giá đơn hàng
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-6">
                    {/* CODE */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Mã voucher
                        </p>

                        <h3 className="font-bold text-lg tracking-wide text-gray-800">
                          {v.code}
                        </h3>
                      </div>

                      <button
                        onClick={() =>
                          copyCode(v.code)
                        }
                        className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <FiCopy />
                      </button>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                      <FiCalendar />

                      <span>
                        {formatDate(v.start_date)} -{" "}
                        {formatDate(v.end_date)}
                      </span>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={() =>
                        nav(`/vouchers/${v.id}`)
                      }
                      className="w-full bg-gray-900 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-black transition"
                    >
                      Xem chi tiết

                      <FiArrowRight className="group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherList;