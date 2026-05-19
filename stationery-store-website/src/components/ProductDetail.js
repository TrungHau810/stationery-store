import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiTag } from "react-icons/fi";
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="lg:col-span-8">
                    <div className="w-full bg-white rounded-2xl shadow-sm p-6 space-y-6">

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
                            </div>
                        ) : (
                            <>
                                <ProductInfo product={product} addToCart={addToCart} />

                                {/* DISCOUNTS CENTER */}
                                {!user || user.role === "customer" ? (
                                    <div className="flex justify-center">
                                        <div className="w-full max-w-md bg-gray-50 border rounded-xl p-4">

                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <FiTag className="text-blue-600" />
                                                <h3 className="font-semibold text-gray-800">
                                                    Mã giảm giá
                                                </h3>
                                            </div>

                                            {discounts.length > 0 ? (
                                                discounts
                                                    .filter(d => {
                                                        const now = new Date();
                                                        return now >= new Date(d.start_date) && now <= new Date(d.end_date);
                                                    })
                                                    .map(d => (
                                                        <DiscountCard key={d.id} discount={d} />
                                                    ))
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center">
                                                    Không có mã giảm giá khả dụng
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                            </>
                        )}

                    </div>
                </div>

                {/* REVIEWS */}
                <div className="mt-10 bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-2xl font-bold mb-6">
                        Đánh giá sản phẩm
                    </h2>

                    {user && user.role === "customer" ? (
                        <AddReview
                            user={user}
                            productId={product.id}
                            reloadReviews={fetchReviews}
                        />
                    ) : (
                        <p className="text-gray-500 mb-4 text-sm">
                            Vui lòng đăng nhập với tài khoản khách hàng để đánh giá.
                        </p>
                    )}

                    <RatingSummary
                        average={product.average_rating || 0}
                        count={product.count_reviews || 0}
                        breakdown={reviews[0]?.rating_breakdown || {}}
                    />

                    {loadingReviews ? (
                        <p className="text-center text-gray-500 py-4">
                            Đang tải đánh giá...
                        </p>
                    ) : (
                        <ReviewList reviews={reviews} reloadReviews={fetchReviews} />
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetail;