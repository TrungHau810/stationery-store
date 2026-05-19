import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useEffect, useState } from "react";
import ProductCard from "./layout/ProductCard";

const VoucherDetail = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchVoucherDetail = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoint["discount_detail"](id));
            setDetail(res.data);
        } catch (err) {
            console.error("Lỗi load voucher:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoucherDetail();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="max-w-5xl mx-auto p-6">
            {loading ? (
                <p className="text-gray-500 text-center">Đang tải dữ liệu...</p>
            ) : detail ? (
                <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg text-center mb-6">
                        <h2 className="text-3xl font-bold mb-2">Chi tiết Voucher</h2>
                        <p className="text-sm opacity-90">Thông tin ưu đãi đặc biệt</p>
                    </div>

                    {/* Voucher Info */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex flex-wrap items-center justify-between mb-4">
                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                                Mã: {detail.code}
                            </span>
                            <span className="text-lg font-bold text-red-600">
                                Giảm {detail.discount}%
                            </span>
                        </div>

                        <div className="space-y-2 text-gray-700">
                            <p>
                                <span className="font-semibold">Ngày bắt đầu:</span>{" "}
                                {new Date(detail.start_date).toLocaleString("vi-VN")}
                            </p>
                            <p>
                                <span className="font-semibold">Ngày kết thúc:</span>{" "}
                                {new Date(detail.end_date).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {/* Product List */}
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        Sản phẩm áp dụng
                    </h3>
                    {detail.products && detail.products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {detail.products.map((p) => (
                                <ProductCard key={p.id} item={p} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Không có sản phẩm áp dụng</p>
                    )}
                </>
            ) : (
                <p className="text-gray-500 text-center">Không tìm thấy voucher</p>
            )}
        </div>
    );
};

export default VoucherDetail;