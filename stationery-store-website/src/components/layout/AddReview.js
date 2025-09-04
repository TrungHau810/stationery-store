import { useContext, useState, useEffect, useRef } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";
import { MyUserContext } from "../../configs/Contexts";
import { HiX } from "react-icons/hi";

const AddReview = ({ productId, onReviewAdded }) => {
    const [user] = useContext(MyUserContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // Tạo preview khi chọn ảnh
    useEffect(() => {
        if (!images || images.length === 0) {
            setPreviews([]);
            return;
        }
        const objectUrls = images.map((img) => URL.createObjectURL(img));
        setPreviews(objectUrls);

        // cleanup khi component unmount hoặc images thay đổi
        return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
    }, [images]);

    const handleSubmit = async () => {
        if (!user) {
            Swal.fire({ icon: "error", title: "Chưa đăng nhập", text: "Vui lòng đăng nhập để đánh giá sản phẩm!" });
            return;
        }
        if (!rating || !comment.trim()) {
            Swal.fire({ icon: "error", title: "Lỗi", text: "Vui lòng chọn số sao và nội dung đánh giá!" });
            return;
        }

        try {
            let formData = new FormData();
            formData.append("rating", rating);
            formData.append("comment", comment);
            images.forEach((img) => formData.append("images", img));

            const url = endpoint["reviews_of_product"](productId);
            const res = await authApis().post(url, formData);

            Swal.fire({ icon: "success", title: "Cảm ơn bạn đã đánh giá!" });

            // reset form
            setRating(0);
            setComment("");
            setImages([]);
            if (onReviewAdded) onReviewAdded(res.data);
        } catch (err) {
            console.error("Lỗi khi gửi đánh giá:", err);
            Swal.fire({ icon: "error", title: "Đã xảy ra lỗi", text: err.response?.data?.detail || "Không thể gửi đánh giá" });
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="mb-6 border p-5 rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4">Thêm đánh giá sản phẩm</h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                    <span
                        key={i}
                        className={`cursor-pointer text-3xl transition-colors ${i < rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
                        onClick={() => setRating(i + 1)}
                    >
                        ★
                    </span>
                ))}
            </div>

            {/* Comment */}
            <textarea
                placeholder="Nhập đánh giá của bạn..."
                className="w-full border rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />

            <div className="mb-4">
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="hidden"
                />
                <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                    <span className="text-gray-500">Chọn ảnh hoặc kéo thả vào đây</span>
                </label>
            </div>

            {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative">
                            <img
                                src={src}
                                alt={`Preview ${idx + 1}`}
                                className="w-32 h-32 object-cover rounded border shadow-sm" // tăng từ 20 → 32
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                Gửi đánh giá
            </button>
        </div>
    );
};

export default AddReview;