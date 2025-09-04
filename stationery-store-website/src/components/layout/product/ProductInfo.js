import { Carousel } from "react-bootstrap";
import ViewImage from "../ViewImage";
import { useContext, useState } from "react";
import { MyUserContext } from "../../../configs/Contexts";
import CarouselImage from "./CarouselImage";


const ProductInfo = ({ product, addToCart }) => {

    const [quantity, setQuantity] = useState(1);
    const [user] = useContext(MyUserContext);

    // fallback ảnh nếu không có
    const productImages = [product.image, ...(product.images || []).map(img => img.link)].filter(Boolean);
    const displayImages = productImages.length > 0 ? productImages : ["/default-product.png"];

    return (
        <>
            <CarouselImage
                displayImages={displayImages}
                product={product}
            />
            <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="text-yellow-400 text-lg">
                        {Array.from({ length: 5 }, (_, i) => (
                            <span
                                key={i}
                                className={i < Math.round(product.average_rating) ? "text-yellow-400" : "text-gray-300"}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">
                        {product.count_reviews || 0} đánh giá
                    </span>
                </div>

                {/* Thương hiệu + tình trạng */}
                <p className="text-gray-600 mb-2">
                    Thương hiệu:{" "}
                    <span className="text-blue-600">{product.brand}</span> |{" "}
                    <span className={`ml-1 font-semibold ${product.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                        {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                </p>
                <p className="text-sm text-gray-500 mb-4">Mã sản phẩm: {product.id}</p>

                {/* Giá */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                        {Number(product.price).toLocaleString("vi-VN")}₫
                    </span>
                    {/* TODO: thay -20% bằng logic từ discount thực tế */}
                    <span className="line-through text-gray-400">
                        {(Number(product.price) * 1.2).toLocaleString("vi-VN")}₫
                    </span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -20%
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
                        <button
                            className="flex-1 border-2 border-blue-500 text-blue-500 py-3 rounded hover:bg-blue-50 transition"
                            onClick={() => addToCart({ user, product, quantity })}
                        >
                            Thêm vào giỏ
                        </button>
                    ) : (
                        <button className="flex-1 bg-gray-500 text-white py-3 rounded cursor-not-allowed" disabled>
                            Hết hàng
                        </button>
                    )}
                    {product.quantity > 0 ? (
                        <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded hover:from-blue-600 hover:to-blue-700 transition transform active:scale-95">
                            Mua ngay
                        </button>
                    ) : (
                        <button className="flex-1 bg-gray-500 text-white py-3 rounded cursor-not-allowed" disabled>
                            Không thể mua
                        </button>
                    )}
                </div>


                {/* Mô tả */}
                {product.description && (
                    <div className="mt-6 bg-gray-50 p-4 rounded border">
                        <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
                        <div
                            className="text-gray-700 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}

            </div>
        </>
    );
}

export default ProductInfo;