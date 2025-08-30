import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { authApis, endpoint } from "../../configs/Apis";
import {
    CurrencyDollarIcon,
    CalendarDaysIcon,
    FireIcon,
} from "@heroicons/react/24/solid";

const RevenueStore = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                let [totalRes, todayRes, monthlyRes, topRes] = await Promise.all([
                    authApis().get(endpoint["total_revenue"]),
                    authApis().get(endpoint["today_revenue"]),
                    authApis().get(endpoint["monthly_revenue"]),
                    authApis().get(endpoint["top_products"]),
                ]);

                setTotalRevenue(totalRes.data.total_revenue);
                setTodayRevenue(todayRes.data.today_revenue);
                setMonthlyRevenue(monthlyRes.data);
                setTopProducts(topRes.data);
            } catch (err) {
                console.error("Lỗi load báo cáo:", err);
            }
        };

        loadData();
    }, []);

    return (
        <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800">
                🚀 Báo cáo doanh thu
            </h2>

            {/* Tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition">
                    <CurrencyDollarIcon className="h-10 w-10 text-blue-600" />
                    <div>
                        <h3 className="text-sm text-gray-500">Tổng doanh thu</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {totalRevenue.toLocaleString()} VND
                        </p>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition">
                    <CalendarDaysIcon className="h-10 w-10 text-green-600" />
                    <div>
                        <h3 className="text-sm text-gray-500">Doanh thu hôm nay</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {todayRevenue.toLocaleString()} VND
                        </p>
                    </div>
                </div>
            </div>

            {/* Biểu đồ doanh thu */}
            <div className="bg-white shadow-lg rounded-xl p-6 mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    📅 Doanh thu theo tháng của năm {new Date().getFullYear()}
                </h3>
                <div className="w-full h-80">
                    <ResponsiveContainer>
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="total_revenue"
                                fill="url(#colorRevenue)"
                                radius={[8, 8, 0, 0]}
                            />
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top sản phẩm */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">
                    🔥 Top sản phẩm bán chạy
                </h3>
                <ul className="space-y-4">
                    {topProducts.map((p, idx) => {
                        const maxSold = topProducts[0]?.total_sold || 1;
                        const percent = (p.total_sold / maxSold) * 100;
                        return (
                            <li
                                key={p.orderdetail__product__id}
                                className="p-4 bg-gray-50 rounded-lg shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-700">
                                        {idx + 1}. {p.orderdetail__product__name}
                                    </span>
                                    <span className="font-bold text-blue-600">
                                        {p.total_sold} sp
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default RevenueStore;