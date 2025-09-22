import { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import { authApis, endpoint } from "../../configs/Apis";
import {
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/solid";

const RevenueDashboard = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState({ revenue: 0, count_order: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueByMonth, setRevenueByMonth] = useState({ revenue: 0 });
    const [revenueByQuarter, setRevenueByQuarter] = useState([]);
    const [revenueMonthPresent, setRevenueMonthPresent] = useState({ revenue: 0 });
    const [orderPercentage, setOrderPercentage] = useState([]);
    const [cancellationRate, setCancellationRate] = useState(0);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYearQuarter, setSelectedYearQuarter] = useState(new Date().getFullYear());

    const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#f43f5e"];

    const loadData = async () => {
        try {
            const [
                totalRes,
                todayRes,
                monthlyRes,
                topProductsRes,
                revenueMonthPresentRes,
                orderPercentageRes,
                cancellationRateRes
            ] = await Promise.all([
                authApis().get(endpoint["total_revenue"]),
                authApis().get(endpoint["today_revenue"]),
                authApis().get(endpoint["monthly_revenue"]),
                authApis().get(endpoint["top_products"]),
                authApis().get(endpoint["revenue_month_present"]),
                authApis().get(endpoint["order-percentage-by-status"]),
                authApis().get(endpoint["cancellation-rate"]),
            ]);

            // Chuyển object orderPercentageRes.data thành array
            const orderPercentageArray = Object.entries(orderPercentageRes.data).map(([status, percentage]) => ({
                status,
                percentage
            }));

            setTotalRevenue(totalRes.data.total_revenue);
            setTodayRevenue(todayRes.data);
            setMonthlyRevenue(monthlyRes.data);
            setTopProducts(topProductsRes.data);
            setRevenueMonthPresent(revenueMonthPresentRes.data);
            setOrderPercentage(orderPercentageArray);
            setCancellationRate(cancellationRateRes.data.cancellation_rate);
        } catch (err) {
            console.error("Lỗi load báo cáo:", err);
        }
    };

    const loadRevenueByMonthYear = async (year, month) => {
        try {
            const res = await authApis().get(`${endpoint["revenue_by_month"]}?month=${year}-${month}`);
            setRevenueByMonth(res.data);
        } catch (err) {
            console.error("Lỗi load báo cáo theo tháng năm:", err);
        }
    };

    const loadRevenueByQuarter = async (year) => {
        try {
            const res = await authApis().get(`${endpoint["revenue_by_quarter"]}?year=${year}`);
            setRevenueByQuarter(res.data);
        } catch (err) {
            console.error("Lỗi load báo cáo theo quý:", err);
        }
    };

    useEffect(() => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        setSelectedMonth(`0${currentMonth}`.slice(-2));
        setSelectedYear(currentYear);
        setSelectedYearQuarter(currentYear);

        loadData();
        loadRevenueByMonthYear(currentYear, `0${currentMonth}`.slice(-2));
        loadRevenueByQuarter(currentYear);
    }, []);

    useEffect(() => {
        loadRevenueByMonthYear(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        loadRevenueByQuarter(selectedYearQuarter);
    }, [selectedYearQuarter]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800">
                Dashboard thống kê - báo cáo
            </h2>

            {/* Thẻ thông tin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <Card icon={<CurrencyDollarIcon className="h-10 w-10 text-blue-600" />} title="Tổng doanh thu" value={totalRevenue.toLocaleString() + " VND"} />
                <Card icon={<CalendarDaysIcon className="h-10 w-10 text-green-600" />} title="Doanh thu hôm nay" value={Number(todayRevenue.revenue).toLocaleString() + " VND"} />
                <Card icon={<CalendarDaysIcon className="h-10 w-10 text-purple-600" />} title={`Doanh thu tháng ${selectedMonth} - ${selectedYear}`} value={Number(revenueMonthPresent.revenue).toLocaleString() + " VND"} />
                <Card icon={<ShoppingCartIcon className="h-10 w-10 text-yellow-500" />} title="Đơn hàng hôm nay" value={todayRevenue.count_order + " đơn hàng"} />
            </div>

            {/* Biểu đồ doanh thu theo tháng */}
            <ChartContainer title={`Doanh thu theo các tháng - ${new Date().getFullYear()}`}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString("vi-VN") + " VND"} />
                        <Bar dataKey="total_revenue" name="Doanh thu" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Bộ lọc tháng/năm */}
            <div className="flex flex-wrap gap-4 mb-8 items-center">
                <Select label="Chọn năm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} options={5} />
                <Select label="Chọn tháng" value={selectedMonth} onChange={(e) => setSelectedMonth(`0${e.target.value}`.slice(-2))} options={12} prefix="Tháng " />
            </div>

            {/* Doanh thu tháng hiện tại */}
            <ChartContainer title={`Doanh thu tháng ${selectedMonth} - ${selectedYear}`}>
                <p className="text-xl font-bold">{Number(revenueByMonth.revenue).toLocaleString("vi-VN")} VNĐ</p>
            </ChartContainer>

            {/* Bộ lọc quý */}
            <Select label="Chọn năm quý" value={selectedYearQuarter} onChange={(e) => setSelectedYearQuarter(Number(e.target.value))} options={5} />

            {/* Biểu đồ doanh thu theo quý */}
            <ChartContainer title={`Doanh thu theo quý (${selectedYearQuarter})`}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByQuarter} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString("vi-VN") + " VND"} />
                        <Bar dataKey="revenue" name="Doanh thu" fill="#f97316" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Top sản phẩm bán chạy */}
            <ChartContainer title="Top sản phẩm bán chạy">
                {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={topProducts}
                                dataKey="total_sold"
                                nameKey="orderdetail__product__name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} sản phẩm`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center">Chưa có dữ liệu sản phẩm</p>
                )}
            </ChartContainer>

            {/* Các biểu đồ tròn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Tỉ lệ đơn theo trạng thái */}
                <ChartContainer title="Tỉ lệ đơn theo trạng thái">
                    {orderPercentage.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={orderPercentage}
                                    dataKey="percentage"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.status} (${entry.percentage.toFixed(2)}%)`}
                                >
                                    {orderPercentage.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center">Chưa có dữ liệu</p>
                    )}
                </ChartContainer>

                {/* Tỉ lệ huỷ đơn */}
                <ChartContainer title="Tỉ lệ huỷ đơn">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: "Huỷ đơn", value: cancellationRate },
                                    { name: "Đơn hợp lệ", value: 100 - cancellationRate },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}%`}
                            >
                                <Cell fill="#f43f5e" />
                                <Cell fill="#3b82f6" />
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};

// Card component
const Card = ({ icon, title, value }) => (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-3 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

// ChartContainer
const ChartContainer = ({ title, children }) => (
    <div className="bg-white shadow-md rounded-xl p-6 mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        {children}
    </div>
);

// Select component
const Select = ({ label, value, onChange, options, prefix = "" }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            className="block w-36 md:w-40 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={value}
            onChange={onChange}
        >
            {Array.from({ length: options }).map((_, i) => {
                const val = prefix ? `0${i + 1}`.slice(-2) : new Date().getFullYear() - i;
                return (
                    <option key={i} value={val}>
                        {prefix ? prefix + (i + 1) : new Date().getFullYear() - i}
                    </option>
                );
            })}
        </select>
    </div>
);

export default RevenueDashboard;