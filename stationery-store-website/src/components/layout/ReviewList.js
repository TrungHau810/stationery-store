import { useContext, useState } from "react";
import { MyUserContext } from "../../configs/Contexts";
import ViewImage from "./ViewImage";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";
import ReviewCard from "./review/ReviewCard";

const ReviewList = ({ reviews, onReviewDeleted, reloadReviews }) => {
    const [user] = useContext(MyUserContext);
    const [viewImg, setViewImg] = useState(null);
    const reloadReviewsProp = reloadReviews;

    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-6 p-6 bg-gray-50 border rounded text-center text-gray-500">
                Chưa có đánh giá nào
            </div>
        );
    }

    const deleteReview = async (id) => {
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
                <ReviewCard key={r.id} review={r} onImageClick={setViewImg} deleteReview={deleteReview} reloadReviews={reloadReviewsProp} user={user} />
            ))}

            {/* Modal xem ảnh */}
            {viewImg && <ViewImage img={viewImg} onClose={() => setViewImg(null)} />}
        </div>
    );
};

export default ReviewList;