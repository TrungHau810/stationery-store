import { useContext, useState } from "react";
import { MyUserContext } from "../../configs/Contexts";
import { formatRelativeTime } from "../../utils/FormatDateTime";
import ViewImage from "./ViewImage";
import { HiX } from "react-icons/hi";
import { HiStar, HiOutlineStar } from "react-icons/hi";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";

const ReviewList = ({ reviews, onReviewDeleted, reloadReviews }) => {
    const [user] = useContext(MyUserContext);
    const [viewImg, setViewImg] = useState(null);

    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-6 p-6 bg-gray-50 border rounded text-center text-gray-500">
                Chưa có đánh giá nào
            </div>
        );
    }

    const deleteReview = async(id) => {
        Swal.fire({
            title: 'Bạn có chắc muốn xoá đánh giá này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await authApis().delete(endpoint['review_detail'](id));
                Swal.fire('Đã xoá!', 'Đánh giá của bạn đã được xoá.', 'success');
                if (onReviewDeleted) {
                    onReviewDeleted(id);
                }
                if (reloadReviews) {
                    reloadReviews();
                }
            }
        });
    }

    return (
        <div className="space-y-6 mt-6">
            {reviews.map((r) => (
                <div
                    key={r.id}
                    className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={r.user?.avatar || "/default-avatar.jpg"}
                                alt={r.user?.full_name || "Ẩn danh"}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-semibold text-gray-800">
                                {r.user?.full_name || "Ẩn danh"}
                            </span>
                        </div>
                        <div className="flex gap-0.5 text-yellow-400">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className="text-lg">
                                    {i < r.rating ? <HiStar /> : <HiOutlineStar />}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg mb-3">
                        {r.comment}
                    </p>

                    {/* Images */}
                    {r.images && r.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                            {r.images.map((img) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    alt="Hình đánh giá"
                                    className="w-24 h-24 object-cover rounded-lg cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 transition-transform duration-200"
                                    onClick={() => setViewImg(img.url)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                        <span>{formatRelativeTime(r.created_date)}</span>
                        {user && user.id === r.user?.id && (
                            <button className="text-red-500 hover:text-red-600 flex items-center gap-1" onClick={() => deleteReview(r.id)}>
                                <HiX className="w-4 h-4" /> Xoá
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* Modal xem ảnh */}
            {viewImg && <ViewImage img={viewImg} onClose={() => setViewImg(null)} />}
        </div>
    );
};

export default ReviewList;