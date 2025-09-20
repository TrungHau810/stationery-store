import { useState } from "react";
import { HiOutlineStar, HiStar, HiX } from "react-icons/hi";
import { formatRelativeTime } from "../../../utils/FormatDateTime";
import { roleLabels } from "../../Profile";
import Apis, { authApis, endpoint } from "../../../configs/Apis";
import Swal from "sweetalert2";

const ReviewCard = ({ review, user, reloadReviews, onImageClick }) => {
    const [replyText, setReplyText] = useState("");

    // Xử lý gửi reply
    const handleReply = async () => {
        if (!replyText.trim()) return;

        try {
            const res = await authApis().post(endpoint["add_reply"](review.id), {
                reply: replyText,
            });

            console.log("Reply sent:", res.data);

            Swal.fire({
                icon: "success",
                title: "Đã phản hồi",
                timer: 1500,
                showConfirmButton: false,
            });

            setReplyText("");
            reloadReviews?.();
        } catch (err) {
            console.error("Lỗi gửi reply:", err);
            Swal.fire({
                icon: "error",
                title: "Gửi phản hồi thất bại",
                text: err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại",
            });
        }
    };

    // Xóa review hoặc reply
    const deleteReview = async (id) => {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "Bạn có chắc muốn xóa?",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (confirm.isConfirmed) {
            try {
                await authApis().delete(endpoint["review_detail"](id));
                Swal.fire({
                    icon: "success",
                    title: "Đã xóa",
                    timer: 1500,
                    showConfirmButton: false,
                });
                reloadReviews?.();
            } catch (err) {
                console.error("Lỗi xóa review:", err);
                Swal.fire({
                    icon: "error",
                    title: "Xóa thất bại",
                    text: err.response?.data?.detail || "Có lỗi xảy ra",
                });
            }
        }
    };

    return (
        <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={review.user?.avatar || "/default-avatar.jpg"}
                        alt={review.user?.full_name || "Ẩn danh"}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-gray-800">
                        {review.user?.full_name || "Ẩn danh"}
                    </span>
                </div>
                <div className="flex gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-lg">
                            {i < review.rating ? <HiStar /> : <HiOutlineStar />}
                        </span>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg mb-3">
                {review.comment}
            </p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                    {review.images.map((img) => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt="Hình đánh giá"
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 transition-transform duration-200"
                            onClick={() => onImageClick(img.url)}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                <span>{formatRelativeTime(review.created_date)}</span>
                {user && user.id === review.user?.id && (
                    <button
                        className="text-red-500 hover:text-red-600 flex items-center gap-1"
                        onClick={() => deleteReview(review.id)}
                    >
                        <HiX className="w-4 h-4" /> Xoá
                    </button>
                )}
            </div>

            {/* Reply List */}
            {review.reply && review.reply.length > 0 && (
                <div className="mt-4 space-y-3 pl-5 border-l border-gray-200">
                    {review.reply.map((rep) => (
                        <div key={rep.id} className="bg-gray-50 border rounded-lg p-3">
                            <div className="flex items-center gap-3 mb-2">
                                <img
                                    src={rep.user?.avatar || "/default-avatar.jpg"}
                                    alt={rep.user?.full_name || "Ẩn danh"}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="font-semibold text-gray-700">
                                    {rep.user?.full_name || "Ẩn danh"}
                                </span>
                                <span
                                    className={`text-gray-400 ${roleLabels[rep.user?.role]?.color || "text-gray-400"
                                        }`}
                                >
                                    {roleLabels[rep.user?.role]?.label || "Không xác định"}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{rep.comment}</p>

                            {rep.images && rep.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {rep.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt="Hình reply"
                                            className="w-16 h-16 object-cover rounded-md cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 transition-transform duration-200"
                                            onClick={() => onImageClick(img.url)}
                                        />
                                    ))}
                                </div>
                            )}

                            {user && user.id === rep.user?.id && (
                                <div className="flex justify-end mt-2 text-xs text-gray-400">
                                    <button
                                        className="text-red-500 hover:text-red-600 flex items-center gap-1"
                                        onClick={() => deleteReview(rep.id)}
                                    >
                                        <HiX className="w-3 h-3" /> Xoá
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Input reply */}
            {user && (user.role === 'staff' || user.role === 'manager') && (
                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Viết phản hồi..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={handleReply}
                    >
                        Gửi
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;