import { useContext, useState } from "react";
import { MyUserContext } from "../../../configs/Contexts";
import CarouselImage from "./CarouselImage";
import { useNavigate } from "react-router-dom";


const ProductInfo = ({ product, addToCart }) => {

    const [quantity, setQuantity] = useState(1);
    const [user] = useContext(MyUserContext);
    const nav = useNavigate();

    // fallback ảnh nếu không có
    const productImages = [product.image, ...(product.images || []).map(img => img.link)].filter(Boolean);
    const displayImages = productImages.length > 0 ? productImages : ["/default-product.png"];

    return (<>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* IMAGE */}
            <div className="rounded-xl overflow-hidden bg-gray-50">
                <CarouselImage
                    displayImages={displayImages}
                    product={product}
                />
            </div>

            {/* INFO */}
            <div className="space-y-4">

                {/* NAME */}
                <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                </h1>

                {/* STARS */}
                <div className="flex items-center gap-2">
                    <div className="text-yellow-400 text-lg">
                        {Array.from({ length: 5 }, (_, i) => (
                            <span key={i}>
                                {i < Math.round(product.average_rating) ? "★" : "☆"}
                            </span>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">
                        {product.count_reviews || 0} đánh giá
                    </span>
                </div>

                {/* BRAND + STOCK */}
                <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">
                        Thương hiệu:{" "}
                        <span className="font-semibold text-blue-600">
                            {product.brand?.name}
                        </span>
                    </p>

                    <span className={`font-semibold ${product.quantity > 0 ? "text-green-600" : "text-red-500"
                        }`}>
                        {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                </div>

                <p className="text-sm text-gray-500">
                    Còn lại: {product.quantity} sản phẩm • SKU: {product.id}
                </p>

                {/* PRICE CARD */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-blue-600">
                            {Number(product.price).toLocaleString("vi-VN")}₫
                        </span>

                        <span className="line-through text-gray-400">
                            {(Number(product.price) * 1.2).toLocaleString("vi-VN")}₫
                        </span>

                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            -20%
                        </span>
                    </div>
                </div>

                {/* QUANTITY */}
                {!user || user.role === "customer" ? (
                    <>
                        <div>
                            <p className="font-medium mb-2">Số lượng</p>
                            <div className="flex items-center border rounded-lg w-36 overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 hover:bg-gray-100"
                                >
                                    -
                                </button>

                                <span className="flex-1 text-center">
                                    {quantity}
                                </span>

                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-3 py-2 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA BUTTONS */}
                        <div className="space-y-3 pt-2">

                            <button
                                disabled={product.quantity <= 0}
                                onClick={() => addToCart({ user, product, quantity })}
                                className="w-full py-3 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                            >
                                Thêm vào giỏ hàng
                            </button>

                            <button
                                disabled={product.quantity <= 0}
                                onClick={async () => {
                                    const success = await addToCart({
                                        user,
                                        product,
                                        quantity: 1
                                    });
                                    if (success) nav("/cart");
                                }}
                                className="w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
                            >
                                Mua ngay
                            </button>

                        </div>
                    </>
                ) : null}

                {/* DESCRIPTION */}
                {product.description && (
                    <div className="bg-gray-50 border rounded-xl p-4 mt-6">
                        <h3 className="font-semibold mb-2">
                            Mô tả sản phẩm
                        </h3>
                        <div
                            className="text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: product.description
                            }}
                        />
                    </div>
                )}
            </div>
        </div>

    </>
    );
}

export default ProductInfo;