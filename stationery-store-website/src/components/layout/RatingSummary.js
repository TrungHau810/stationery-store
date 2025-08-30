const RatingSummary = ({ average, count, breakdown }) => {
    const stars = [5, 4, 3, 2, 1];

    // Tạo mảng 5 phần tử cho hiển thị sao trung bình
    const renderStars = () => {
        const fullStars = Math.floor(average);
        const hasHalfStar = average - fullStars >= 0.5;
        return Array.from({ length: 5 }, (_, i) => {
            if (i < fullStars) return <span key={i}>★</span>;
            if (i === fullStars && hasHalfStar) return <span key={i}>☆</span>;
            return <span key={i}>☆</span>;
        });
    };

    return (
        <div className="bg-white p-4 border rounded mb-6">
            <div className="flex items-center gap-6">

                {/* Phần hiển thị trung bình */}
                <div className="text-center">
                    <span className="text-4xl font-bold text-yellow-500">
                        {average.toFixed(1)}
                    </span>
                    <div className="text-yellow-400 text-lg">
                        {renderStars()}
                    </div>
                    <p className="text-sm text-gray-500">{count} lượt đánh giá</p>
                </div>

                {/* Phần breakdown */}
                <div className="flex-1">
                    {stars.map((s) => (
                        <div key={s} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-10">{s} ★</span>
                            <div className="flex-1 bg-gray-200 rounded h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded"
                                    style={{
                                        width: `${count > 0 ? ((breakdown[s] || 0) / count) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <span className="text-sm text-gray-500">{breakdown[s] || 0}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default RatingSummary;