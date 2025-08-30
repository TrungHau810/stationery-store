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
} from "recharts";

const LoyaltyPoint = () => {
    const [loyaltyPointHistory, setLoyaltyPointHistory] = useState([]);
    const [user] = useContext(MyUserContext);
    const nav = useNavigate();

    const fetchLoyaltyPointHistory = async () => {
        try {
            const res = await authApis().get(endpoint["loyalty_history"]);
            setLoyaltyPointHistory(res.data.results);
        } catch (err) {
            console.error("Lỗi load lịch sử điểm thưởng:", err);
        }
    };

    useEffect(() => {
        fetchLoyaltyPointHistory();
    }, []);

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = useMemo(() => {
        const dataMap = {};
        loyaltyPointHistory.forEach((item) => {
            const dateObj = new Date(item.created_date);
            const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
            const year = dateObj.getFullYear();
            const monthLabel = `${month}/${year}`;

            if (!dataMap[monthLabel])
                dataMap[monthLabel] = { month: monthLabel, EARN: 0, REDEEM: 0 };
            dataMap[monthLabel][item.type] += item.point;
        });
        return Object.values(dataMap);
    }, [loyaltyPointHistory]);

    const totalPoints = loyaltyPointHistory.reduce((sum, item) => {
        return item.type === "EARN" ? sum + item.point : sum - item.point;
    }, 0);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-3">Vui lòng đăng nhập</h1>
                    <p className="mb-6 text-gray-600">
                        Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.
                    </p>
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
            <div className="bg-blue-100 text-blue-900 rounded-lg p-6 text-center shadow">
                <h2 className="text-2xl font-bold mb-2">
                    Điểm thưởng hiện tại của bạn
                </h2>
                <p className="text-xl font-semibold">
                    {totalPoints.toLocaleString()}₫
                </p>
            </div>

            {/* Biểu đồ */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Biểu đồ tích điểm</h2>
                <div className="w-full h-72">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(v) => v.toLocaleString()} />
                                <Legend />
                                <Bar dataKey="EARN" fill="#34D399" name="Tích điểm" />
                                <Bar dataKey="REDEEM" fill="#F87171" name="Sử dụng điểm" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-400 mt-20">
                            Chưa có dữ liệu để hiển thị biểu đồ
                        </p>
                    )}
                </div>
            </div>

            {/* Lịch sử */}
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">Lịch sử tích điểm</h2>
                {loyaltyPointHistory.length > 0 ? (
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 border-b text-left">Mã đơn hàng</th>
                                <th className="py-3 px-4 border-b text-center">Thời gian</th>
                                <th className="py-3 px-4 border-b text-center">Loại</th>
                                <th className="py-3 px-4 border-b text-right">Điểm GD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loyaltyPointHistory.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => nav(`/purchase/order/${item.order}`)}
                                    className={`cursor-pointer transition hover:opacity-80 ${item.type === "REDEEM"
                                            ? "bg-red-50 text-red-700 font-semibold"
                                            : "bg-green-50 text-green-800"
                                        }`}
                                >
                                    <td className="py-2 px-4 border-b">#{item.order}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        {new Date(item.created_date).toLocaleString("vi-VN")}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        {item.type === "EARN" ? "Tích điểm" : "Sử dụng điểm"}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {item.point.toLocaleString()}₫
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-400 text-center py-8">
                        Chưa có lịch sử tích điểm
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoyaltyPoint;