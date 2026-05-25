import { useContext, useEffect, useMemo, useState } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { LoadingSpinner } from "./layout/LoadingSpinner";

import {
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiLogIn,
  FiClock,
  FiHash,
} from "react-icons/fi";

const LoyaltyPoint = () => {
  const [loyaltyPointHistory, setLoyaltyPointHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [filterType, setFilterType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);

  const [user] = useContext(MyUserContext);

  const nav = useNavigate();

  const fetchLoyaltyPoints = async () => {
    try {
      const res = await authApis().get(endpoint["loyalty"]);
      setTotalPoints(res.data.total_point);
    } catch (err) {
      console.error("Lỗi load điểm thưởng:", err);
    }
  };

  const fetchLoyaltyPointHistory = async (
    pageNumber = 1,
    type = filterType
  ) => {
    try {
      setLoading(true);

      let url = endpoint["loyalty_history"] + `?page=${pageNumber}`;

      if (type !== "ALL") url += `&type=${type}`;

      const res = await authApis().get(url);

      setLoyaltyPointHistory(res.data.results || []);

      const pages =
        res.data.results.length > 0
          ? Math.ceil(res.data.count / pageSize)
          : 1;

      setTotalPages(pages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Lỗi load lịch sử điểm thưởng:", err);

      setLoyaltyPointHistory([]);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoyaltyPoints();
      fetchLoyaltyPointHistory(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) fetchLoyaltyPointHistory(1, filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, user]);

  const chartData = useMemo(() => {
    const dataMap = {};

    loyaltyPointHistory.forEach((item) => {
      const dateObj = new Date(item.created_date);

      const month = (dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0");

      const year = dateObj.getFullYear();

      const monthLabel = `${month}/${year}`;

      if (!dataMap[monthLabel]) {
        dataMap[monthLabel] = {
          month: monthLabel,
          EARN: 0,
          REDEEM: 0,
        };
      }

      dataMap[monthLabel][item.type] += item.point;
    });

    return Object.values(dataMap).sort((a, b) => {
      const [ma, ya] = a.month.split("/").map(Number);
      const [mb, yb] = b.month.split("/").map(Number);

      return ya - yb || ma - mb;
    });
  }, [loyaltyPointHistory]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
            <FiLogIn className="text-3xl text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Vui lòng đăng nhập
          </h1>

          <p className="text-gray-500 mb-6">
            Bạn cần đăng nhập để xem điểm thưởng.
          </p>

          <button
            onClick={() => nav("/login")}
            className="w-full py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[28px] shadow-xl overflow-hidden">
          <div className="p-8 md:p-10 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <FiGift className="text-3xl" />
                  </div>

                  <div>
                    <p className="text-white/80 text-sm">
                      Tổng điểm hiện tại
                    </p>

                    <h1 className="text-4xl font-bold">
                      {totalPoints.toLocaleString()}
                    </h1>
                  </div>
                </div>

                <p className="text-white/80">
                  Theo dõi toàn bộ lịch sử tích điểm và sử
                  dụng điểm thưởng của bạn.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp />
                    <span className="text-sm">
                      Tích điểm
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold">
                    {
                      loyaltyPointHistory.filter(
                        (i) => i.type === "EARN"
                      ).length
                    }
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingDown />
                    <span className="text-sm">
                      Đổi điểm
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold">
                    {
                      loyaltyPointHistory.filter(
                        (i) => i.type === "REDEEM"
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-sm inline-flex gap-2">
          {[
            {
              key: "ALL",
              label: "Tất cả",
            },
            {
              key: "EARN",
              label: "Tích điểm",
            },
            {
              key: "REDEEM",
              label: "Sử dụng điểm",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key)}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all
                            ${filterType === item.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <FiBarChart2 className="text-indigo-600 text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Thống kê điểm thưởng
              </h2>

              <p className="text-sm text-gray-500">
                Dữ liệu theo tháng
              </p>
            </div>
          </div>

          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="EARN"
                    fill="#10B981"
                    radius={[10, 10, 0, 0]}
                    name="Tích điểm"
                  />

                  <Bar
                    dataKey="REDEEM"
                    fill="#EF4444"
                    radius={[10, 10, 0, 0]}
                    name="Sử dụng điểm"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Chưa có dữ liệu biểu đồ
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Lịch sử giao dịch điểm
            </h2>
          </div>

          {loading && loyaltyPointHistory.length === 0 ? (
            <div className="py-20">
              <LoadingSpinner content="Đang tải dữ liệu..." />
            </div>
          ) : loyaltyPointHistory.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-600 text-sm">
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <FiHash />
                          Đơn hàng
                        </div>
                      </th>

                      <th className="px-6 py-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <FiClock />
                          Thời gian
                        </div>
                      </th>

                      <th className="px-6 py-4 text-center font-semibold">
                        Loại
                      </th>

                      <th className="px-6 py-4 text-right font-semibold">
                        Điểm
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loyaltyPointHistory.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() =>
                          nav(
                            `/purchase/orders/${item.order}`
                          )
                        }
                        className="border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="px-6 py-5 font-semibold text-gray-700">
                          #{item.order}
                        </td>

                        <td className="px-6 py-5 text-center text-gray-500">
                          {new Date(
                            item.created_date
                          ).toLocaleString("vi-VN")}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium
                                                        ${item.type ===
                                "EARN"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {item.type === "EARN"
                              ? "Tích điểm"
                              : "Sử dụng"}
                          </span>
                        </td>

                        <td
                          className={`px-6 py-5 text-right font-bold
                                                    ${item.type === "EARN"
                              ? "text-green-600"
                              : "text-red-600"
                            }`}
                        >
                          {item.type === "EARN"
                            ? "+"
                            : "-"}
                          {item.point.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-100">
                  <button
                    onClick={() =>
                      fetchLoyaltyPointHistory(page - 1)
                    }
                    disabled={page === 1 || loading}
                    className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        fetchLoyaltyPointHistory(p)
                      }
                      className={`w-11 h-11 rounded-2xl font-medium transition
                                            ${p === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      fetchLoyaltyPointHistory(page + 1)
                    }
                    disabled={
                      page === totalPages || loading
                    }
                    className="w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              Không có lịch sử điểm thưởng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoint;