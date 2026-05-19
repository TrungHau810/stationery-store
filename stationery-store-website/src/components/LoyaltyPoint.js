import { useContext, useEffect, useState, useMemo } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { LoadingSpinner } from "./layout/LoadingSpinner";

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

  const fetchLoyaltyPointHistory = async (pageNumber = 1, type = filterType) => {
    try {
      setLoading(true);
      let url = endpoint["loyalty_history"] + `?page=${pageNumber}`;
      if (type !== "ALL") url += `&type=${type}`;
      const res = await authApis().get(url);
      setLoyaltyPointHistory(res.data.results || []);
      const pages = res.data.results.length > 0 ? Math.ceil(res.data.count / pageSize) : 1;
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

  // Khi component mount
  useEffect(() => {
    if (user) {
      fetchLoyaltyPoints();
      fetchLoyaltyPointHistory(1);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Khi filterType thay đổi, reset page về 1
  useEffect(() => {
    if (user) fetchLoyaltyPointHistory(1, filterType);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, user]);

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    const dataMap = {};
    loyaltyPointHistory.forEach((item) => {
      const dateObj = new Date(item.created_date);
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear();
      const monthLabel = `${month}/${year}`;

      if (!dataMap[monthLabel]) dataMap[monthLabel] = { month: monthLabel, EARN: 0, REDEEM: 0 };
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
      <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Vui lòng đăng nhập</h1>
          <p className="mb-6 text-gray-600">Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.</p>
          <button
            onClick={() => nav("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Tổng điểm */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-6 text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          {/* Thay emoji 🎁 bằng icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8m16 0H4m16 0a2 2 0 002-2V7a2 2 0 00-2-2h-5.172a2 2 0 01-1.414-.586L12 3l-1.414 1.414A2 2 0 019.172 5H4a2 2 0 00-2 2v3a2 2 0 002 2m16 0H4"
            />
          </svg>
          Điểm thưởng hiện tại
        </h2>
        <p className="text-3xl font-extrabold">{totalPoints.toLocaleString()} điểm</p>
      </div>

      {/* Bộ lọc */}
      <div className="flex justify-center gap-3">
        {["ALL", "EARN", "REDEEM"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-full border transition font-medium
              ${filterType === type
                ? "bg-blue-500 text-white border-blue-500 shadow"
                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"}`}
          >
            {type === "ALL" ? "Tất cả" : type === "EARN" ? "Tích điểm" : "Sử dụng điểm"}
          </button>
        ))}
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Biểu đồ tích điểm theo tháng</h2>
        <div className="w-full h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend />
                <Bar dataKey="EARN" fill="#34D399" name="Tích điểm" />
                <Bar dataKey="REDEEM" fill="#F87171" name="Sử dụng điểm" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 mt-20">Chưa có dữ liệu để hiển thị biểu đồ</p>
          )}
        </div>
      </div>

      {/* Lịch sử */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Lịch sử tích điểm</h2>
        {loading && loyaltyPointHistory.length === 0 ? (
          <LoadingSpinner content="Đang tải lịch sử tích điểm..." />
        ) : loyaltyPointHistory.length > 0 ? (
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 border-b text-left">Mã đơn hàng</th>
                <th className="py-3 px-4 border-b text-center">Thời gian đặt hàng</th>
                <th className="py-3 px-4 border-b text-center">Loại</th>
                <th className="py-3 px-4 border-b text-right">Điểm GD</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyPointHistory.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => nav(`/purchase/orders/${item.order}`)}
                  className={`cursor-pointer transition hover:bg-gray-50 
                    ${item.type === "REDEEM"
                      ? "text-red-700 font-semibold"
                      : "text-green-700 font-medium"
                    }`}
                >
                  <td className="py-2 px-4 border-b">#{item.order}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(item.created_date).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {item.type === "EARN" ? "Tích điểm" : "Sử dụng điểm"}
                  </td>
                  <td className="py-2 px-4 border-b text-right">{item.point.toLocaleString()} điểm</td>
                </tr>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <tr>
                  <td colSpan="4" className="py-4 text-center">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => fetchLoyaltyPointHistory(page - 1)}
                        disabled={page === 1 || loading}
                        className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => fetchLoyaltyPointHistory(p)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full border transition 
                            ${p === page
                              ? "bg-blue-500 text-white border-blue-500"
                              : "hover:bg-gray-100"}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => fetchLoyaltyPointHistory(page + 1)}
                        disabled={page === totalPages || loading}
                        className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-8">Không có lịch sử với bộ lọc này</p>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPoint;