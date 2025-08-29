import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import DiscountCard from "./layout/DiscountCard";
import { addToCart } from "../utils/Cart";
import { MyUserContext } from "../configs/Contexts";
import Swal from "sweetalert2";

const ProductDetail = () => {
    const [user,] = useContext(MyUserContext);
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState("blue");
    const [product, setProduct] = useState({});
    const [discounts, setDiscounts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { id } = useParams();

    const fetchProductDetail = async () => {
        try {
            const response = await Apis.get(endpoint["product_detail"](id));
            setProduct(response.data);
            setActiveIndex(0); // ảnh đầu tiên
        } catch (err) {
            console.error("Lỗi fetch product detail:", err);
        }
    };

    const fetchDiscountsOfProduct = async (id) => {
        try {
            const response = await Apis.get(endpoint["discounts_of_product"](id));
            console.log("Discounts of product:", response.data);
            setDiscounts(response.data);
        } catch (err) {
            console.error("Lỗi fetch discount detail:", err);
        }
    };

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    useEffect(() => {
        fetchDiscountsOfProduct(product.id);
    }, [product.id]);

    if (!product || (!product.images && !product.image)) {
        return <p className="text-center py-10">Đang tải sản phẩm...</p>;
    }

    // Chuẩn bị mảng ảnh
    const productImages =
        product.images && product.images.length > 0
            ? product.images.map((img) => img.link)
            : product.image
                ? [product.image]
                : [];

    const prevImage = () => {
        setActiveIndex((prev) =>
            prev === 0 ? productImages.length - 1 : prev - 1
        );
    };

    const nextImage = () => {
        setActiveIndex((prev) =>
            prev === productImages.length - 1 ? 0 : prev + 1
        );
    };

    const activeImage = productImages[activeIndex];

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carousel ảnh */}
            <div className="relative">
                <div className="w-full h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    {activeImage ? (
                        <img
                            src={activeImage}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-gray-400">Chưa có ảnh</span>
                    )}
                </div>

                {/* Nút Prev / Next */}
                {productImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition"
                        >
                            &#8592;
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition"
                        >
                            &#8594;
                        </button>
                    </>
                )}

                {/* Thumbnail */}
                <div className="flex gap-2 overflow-x-auto mt-2">
                    {productImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`${product.name} ${idx}`}
                            className={`w-20 h-20 rounded border cursor-pointer object-contain ${idx === activeIndex ? "border-blue-500" : "border-gray-300"
                                }`}
                            onClick={() => setActiveIndex(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div>
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-2">
                    Thương hiệu: <span className="text-blue-600">{product.brand}</span> |{" "}
                    <span className="ml-1">
                        Tình trạng:{" "}
                        <span className="text-green-600">
                            {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                        </span>
                    </span>
                </p>
                <span className="text-sm pb-2">
                    Số lượng còn lại: <span className="text-green-600">{product.quantity}</span>
                </span>
                <p className="text-sm text-gray-500 mb-4">Mã sản phẩm: {product.id}</p>

                {/* Giá */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                        {Number(product.price).toLocaleString("vi-VN")}₫
                    </span>
                    <span className="line-through text-gray-400">
                        {(Number(product.price) * 1.2).toLocaleString("vi-VN")}₫
                    </span>
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                        Tiết kiệm{" "}
                        {((Number(product.price) * 1.2 - Number(product.price)).toLocaleString(
                            "vi-VN"
                        ))}₫
                    </span>
                </div>

                {/* Số lượng */}
                <div className="mb-4">
                    <span className="font-semibold">Số lượng:</span>
                    <div className="flex items-center mt-2 border rounded w-32">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-1 border-r hover:bg-gray-100"
                        >
                            -
                        </button>
                        <span className="flex-1 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-1 border-l hover:bg-gray-100"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-3 mb-6">
                    {product.quantity > 0 ? (
                        <button className="flex-1 border-2 border-blue-500 text-blue-500 py-3 rounded hover:bg-blue-50 transition"
                            onClick={() => addToCart({ user, product, quantity })}>
                            Thêm vào giỏ
                        </button>
                    ) : (
                        <button className="flex-1 bg-gray-500 text-white py-3 rounded cursor-not-allowed" disabled>
                            Hết hàng
                        </button>
                    )}
                    {product.quantity > 0 ? (
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
                            Mua ngay
                        </button>
                    ) : (
                        <button className="flex-1 bg-gray-500 text-white py-3 rounded cursor-not-allowed" disabled>
                            Không thể mua
                        </button>
                    )}
                </div>

                <div className="bg-gray-50 border p-4 rounded">
                    <p className="font-semibold mb-2">Mã giảm giá khi mua sản phẩm</p>
                    {discounts
                        .filter((discount) => {
                            const now = new Date();
                            const start = new Date(discount.start_date);
                            const end = new Date(discount.end_date);
                            return now >= start && now <= end;
                        })
                        .map((discount) => (
                            <DiscountCard key={discount.id} discount={discount} />
                        ))
                    }
                    {discounts.length === 0 && (<p className="text-gray-500">Không có mã giảm giá nào</p>)}
                </div>

                {product.description && (
                    <div className="mt-6 bg-gray-50 p-4 rounded border">
                        <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
                        <div
                            className="text-gray-700 text-sm"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;