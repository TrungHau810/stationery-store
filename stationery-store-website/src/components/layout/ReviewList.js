import { formatRelativeTime } from "../../utils/FormatDateTime";

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-6 p-4 bg-gray-50 border rounded text-center text-gray-500">
                Chưa có đánh giá nào
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-6">
            {reviews.map((r) => (
                <div key={r.id} className="bg-white border p-4 rounded shadow-sm">
                    {/* User + Rating */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{r.user?.full_name || "Ẩn danh"}</span>
                        <div className="text-yellow-400">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-gray-700">{r.comment}</p>

                    {/* Hình ảnh */}
                    {r.images && r.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {r.images.map((img) => (
                                <img
                                    key={img.id}
                                    src={img.link}
                                    alt=""
                                    className="w-20 h-20 object-cover rounded cursor-pointer hover:scale-105 transition"
                                />
                            ))}
                        </div>
                    )}

                    {/* Thời gian */}
                    <span className="text-xs text-gray-400 block mt-2">
                        {formatRelativeTime(r.created_date)}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;