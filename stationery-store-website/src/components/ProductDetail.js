import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import DiscountCard from "./layout/DiscountCard";
import { addToCart } from "../utils/Cart";
import { MyUserContext } from "../configs/Contexts";
import RatingSummary from "./layout/RatingSummary";
import ReviewList from "./layout/ReviewList";
import { Carousel } from "react-bootstrap";
import AddReview from "./layout/AddReview";
import ViewImage from "./layout/ViewImage";
import ProductInfo from "./layout/product/ProductInfo";


const ProductDetail = () => {
    const [user] = useContext(MyUserContext);
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState({});
    const [discounts, setDiscounts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { id } = useParams();
    const [viewImageSrc, setViewImageSrc] = useState(null);

    const fetchData = async () => {
        try {
            const [productRes, reviewRes, discountRes] = await Promise.all([
                Apis.get(endpoint["product_detail"](id)),
                Apis.get(endpoint["reviews_of_product"](id)),
                Apis.get(endpoint["discounts_of_product"](id)),
            ]);

            setProduct(productRes.data);
            setReviews(reviewRes.data.results || []);
            setDiscounts(discountRes.data);
            setActiveIndex(0);
        } catch (err) {
            console.error("Lỗi khi fetch dữ liệu:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // fallback ảnh nếu không có
    const productImages = [product.image, ...(product.images || []).map(img => img.link)].filter(Boolean);
    const displayImages = productImages.length > 0 ? productImages : ["/default-product.png"];

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProductInfo product={product} addToCart={addToCart} />

            <div className="bg-gray-50 border p-4 rounded mb-6">
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

            {/* Phần đánh giá */}
            <div className="col-span-2 mt-10">
                <h2 className="text-2xl font-semibold mb-4">Đánh giá sản phẩm</h2>
                <AddReview onReviewAdded={(newReview) => setReviews((prev) => [newReview, ...prev])} productId={product.id} />
                <RatingSummary
                    average={product.average_rating || 0}
                    count={product.count_reviews || 0}
                    breakdown={reviews[0]?.rating_breakdown || {}}
                />
                <ReviewList reviews={reviews} reloadReviews={fetchData} />
            </div>
        </div >
    );
};

export default ProductDetail;