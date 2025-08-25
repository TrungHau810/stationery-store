import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần cần dùng của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LoyaltyChart = ({ history }) => {
    if (!history || history.length === 0) return <p>Chưa có dữ liệu biểu đồ</p>;

    // Tách dữ liệu cho tích điểm và tiêu điểm
    const earnData = history
        .filter(h => h.type === "EARN")
        .map(h => ({ date: new Date(h.created_date).toLocaleDateString("vi-VN"), point: h.point }));

    const redeemData = history
        .filter(h => h.type === "REDEMP")
        .map(h => ({ date: new Date(h.created_date).toLocaleDateString("vi-VN"), point: h.point }));

    // Lấy danh sách ngày duy nhất (để làm nhãn trên trục X)
    const labels = [...new Set(history.map(h => new Date(h.created_date).toLocaleDateString("vi-VN")))];

    // Map điểm theo ngày
    const earnPoints = labels.map(date => {
        const item = earnData.find(item => item.date === date);
        return item ? item.point : 0;
    });


    const redeemPoints = labels.map(date => {
        const item = redeemData.find(item => item.date === date);
        return item ? item.point : 0;
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Tích điểm",
                data: earnPoints,
                backgroundColor: "rgba(75, 192, 192, 0.7)"
            },
            {
                label: "Tiêu điểm",
                data: redeemPoints,
                backgroundColor: "rgba(255, 99, 132, 0.7)"
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top"
            },
            title: {
                display: true,
                text: "Biểu đồ tích & tiêu điểm"
            }
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <Bar data={data} options={options} height={300} />
        </div>
    );

};

export default LoyaltyChart;
