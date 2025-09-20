import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import DiscountCard from "./layout/DiscountCard";
import { addToCart } from "../utils/Cart";
import { MyUserContext } from "../configs/Contexts";
import RatingSummary from "./layout/RatingSummary";
import ReviewList from "./layout/ReviewList";
import AddReview from "./layout/AddReview";
import ProductInfo from "./layout/product/ProductInfo";

const ProductDetail = () => {
    const [user] = useContext(MyUserContext);
    const [product, setProduct] = useState({});
    const [discounts, setDiscounts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const { id } = useParams();

    // Load product + discounts
    const fetchData = async () => {
        try {
            setLoading(true);
            const [productRes, discountRes] = await Promise.all([
                Apis.get(endpoint["product_detail"](id)),
                Apis.get(endpoint["discounts_of_product"](id)),
            ]);
            setProduct(productRes.data);
            setDiscounts(discountRes.data);
            await fetchReviews(); // load reviews sau khi load product
        } catch (err) {
            console.error("Lỗi khi fetch dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load reviews
    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await Apis.get(endpoint["reviews_of_product"](id));
            setReviews(res.data.results || []);
        } catch (err) {
            console.error("Lỗi khi fetch reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Info */}
            {loading ? (
                <div className="flex justify-center items-center py-20 col-span-2">
                    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
                </div>
            ) : (
                <ProductInfo product={product} addToCart={addToCart} />
            )}

            {/* Discounts */}
            {!user || user.role === "customer" ? (
                loading ? null : (
                    <div className="bg-gray-50 border p-4 rounded mb-6 col-span-2 md:col-span-1">
                        <p className="font-semibold mb-2">Mã giảm giá</p>
                        {discounts.length > 0 ? (
                            discounts
                                .filter((discount) => {
                                    const now = new Date();
                                    const start = new Date(discount.start_date);
                                    const end = new Date(discount.end_date);
                                    return now >= start && now <= end;
                                })
                                .map((discount) => (
                                    <DiscountCard key={discount.id} discount={discount} />
                                ))
                        ) : (
                            <p className="text-gray-500">Không có mã giảm giá nào</p>
                        )}
                    </div>
                )
            ) : null}

            {/* Reviews */}
            <div className="col-span-2 mt-10">
                <h2 className="text-2xl font-semibold mb-4">Đánh giá sản phẩm</h2>

                {user && user.role === "customer" ? (
                    <AddReview
                        user={user}
                        productId={product.id}
                        reloadReviews={fetchReviews}
                    />
                ) : !user ? (
                    <p className="text-gray-500 mb-4">
                        Vui lòng đăng nhập để thêm đánh giá.
                    </p>
                ) : (
                    <p className="text-gray-500 mb-4">
                        Chỉ khách hàng mới có thể thêm đánh giá.
                    </p>
                )}

                <RatingSummary
                    average={product.average_rating || 0}
                    count={product.count_reviews || 0}
                    breakdown={reviews[0]?.rating_breakdown || {}}
                />

                {loadingReviews ? (
                    <p className="text-gray-500 text-center py-4">Đang tải đánh giá...</p>
                ) : (
                    <ReviewList reviews={reviews} reloadReviews={fetchReviews} />
                )}
            </div>
        </div>
    );
};

export default ProductDetail;