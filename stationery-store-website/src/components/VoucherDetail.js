import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useEffect, useState } from "react";
import ProductCard from "./layout/ProductCard";
import { FiCopy } from "react-icons/fi";

const VoucherDetail = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchVoucherDetail = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoint["discount_detail"](id));
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

    const getStatus = (v) => {
        const now = new Date();
        if (now < new Date(v.start_date)) return "coming";
        if (now > new Date(v.end_date)) return "expired";
        return "active";
    };

    const statusStyle = {
        active: "bg-green-100 text-green-700",
        expired: "bg-red-100 text-red-600",
        coming: "bg-yellow-100 text-yellow-700",
    };

    const statusText = {
        active: "Đang áp dụng",
        expired: "Hết hạn",
        coming: "Sắp áp dụng",
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">

            {loading ? (
                <p className="text-gray-500 text-center py-10">
                    Đang tải dữ liệu...
                </p>
            ) : detail ? (
                <>
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg text-center mb-6">
                        <h2 className="text-3xl font-bold mb-1">
                            Chi tiết Voucher
                        </h2>
                        <p className="text-sm opacity-90">
                            Thông tin ưu đãi dành cho bạn
                        </p>
                    </div>

                    {/* VOUCHER INFO */}
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-6">

                        {/* TOP ROW */}
                        <div className="flex flex-wrap items-center justify-between mb-4">

                            <div className="flex items-center gap-3">

                                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                                    {detail.code}
                                </span>

                                <button
                                    onClick={() => copyCode(detail.code)}
                                    className="text-gray-500 hover:text-blue-600"
                                >
                                    <FiCopy />
                                </button>

                            </div>

                            <span className="text-xl font-bold text-red-500">
                                -{detail.discount}%
                            </span>

                        </div>

                        {/* STATUS */}
                        <div className="mb-4">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[getStatus(detail)]}`}>
                                {statusText[getStatus(detail)]}
                            </span>
                        </div>

                        {/* DATE */}
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <span className="font-semibold">Bắt đầu:</span>{" "}
                                {new Date(detail.start_date).toLocaleString("vi-VN")}
                            </p>
                            <p>
                                <span className="font-semibold">Kết thúc:</span>{" "}
                                {new Date(detail.end_date).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {/* PRODUCTS */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">

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
                            <div className="text-center py-10 text-gray-500">
                                Không có sản phẩm áp dụng
                            </div>
                        )}

                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-center">
                    Không tìm thấy voucher
                </p>
            )}
        </div>
    );
};

export default VoucherDetail;