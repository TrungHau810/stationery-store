import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingSummary = ({ average = 0, count = 0, breakdown = {} }) => {
    const stars = [5, 4, 3, 2, 1];

    // Chuẩn hóa breakdown (ép key về số, nếu không có thì = 0)
    const normalizedBreakdown = stars.reduce((acc, s) => {
        acc[s] = Number(breakdown[s] || breakdown[String(s)] || 0);
        return acc;
    }, {});

    // Render sao trung bình
    const renderStars = () => {
        const fullStars = Math.floor(average);
        const hasHalfStar = average - fullStars >= 0.5;

        return Array.from({ length: 5 }, (_, i) => {
            if (i < fullStars) return <FaStar key={i} className="text-yellow-400 inline" />;
            if (i === fullStars && hasHalfStar) return <FaStarHalfAlt key={i} className="text-yellow-400 inline" />;
            return <FaRegStar key={i} className="text-gray-300 inline" />;
        });
    };

    return (
        <div className="bg-white p-4 border rounded mb-6">
            <div className="flex items-center gap-6">

                {/* Điểm trung bình */}
                <div className="text-center">
                    <span className="text-4xl font-bold text-yellow-500">
                        {average.toFixed(1)}
                    </span>
                    <div className="flex justify-center gap-1 text-lg">
                        {renderStars()}
                    </div>
                    <p className="text-sm text-gray-500">{count} lượt đánh giá</p>
                </div>

                {/* Breakdown chi tiết */}
                <div className="flex-1">
                    {stars.map((s) => (
                        <div key={s} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-10 flex items-center gap-1">
                                {s} <FaStar className="text-yellow-400" />
                            </span>
                            <div className="flex-1 bg-gray-200 rounded h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded"
                                    style={{
                                        width: `${count > 0 ? (normalizedBreakdown[s] / count) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <span className="text-sm text-gray-500">{normalizedBreakdown[s]}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default RatingSummary;