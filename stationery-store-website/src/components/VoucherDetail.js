import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useEffect, useState } from "react";
import ProductCard from "./layout/ProductCard";

const VoucherDetail = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy thông tin voucher
    const fetchVoucherDetail = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoint["discount_detail"](id));
            setDetail(res.data);

            if (res.data.products && res.data.products.length > 0) {
                await fetchProducts(res.data.products);
            }
        } catch (err) {
            console.error("Lỗi load voucher:", err);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách sản phẩm theo ID
    const fetchProducts = async (productIds) => {
        try {
            const requests = productIds.map((pid) => {
                const url = endpoint["product_detail"](pid);
                let res = Apis.get(url);
                console.log(res.data);
                return Apis.get(url);
            });
            const responses = await Promise.all(requests);
            setProducts(responses.map((r) => r.data));
        } catch (err) {
            console.error("Lỗi load sản phẩm:", err);
            setProducts([]);
        }
    };


    useEffect(() => {
        fetchVoucherDetail();
    }, [id]);

    useEffect(() => {
        if (products.length > 0) {
            console.log("Products đã load:", products);
        }
    }, [products]);

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {loading ? (
                <p className="text-gray-500 text-center">Đang tải dữ liệu...</p>
            ) : detail ? (
                <>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                        Chi tiết Voucher
                    </h2>

                    <div className="mb-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-3 py-1 rounded-full">
                            Mã: {detail.code}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-2">
                        Giảm giá:{" "}
                        <span className="font-semibold text-red-600">
                            {detail.discount}%
                        </span>
                    </p>

                    <p className="text-gray-600 mb-2">
                        Ngày bắt đầu:{" "}
                        {new Date(detail.start_date).toLocaleString("vi-VN")}
                    </p>
                    <p className="text-gray-600 mb-2">
                        Ngày kết thúc:{" "}
                        {new Date(detail.end_date).toLocaleString("vi-VN")}
                    </p>

                    <h3 className="text-lg font-semibold mt-6 mb-3">
                        Sản phẩm áp dụng:
                    </h3>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Không có sản phẩm áp dụng</p>
                    )}
                </>
            ) : (
                <p className="text-gray-500 text-center">Không tìm thấy voucher</p>
            )}
        </div>
    );
};

export default VoucherDetail;