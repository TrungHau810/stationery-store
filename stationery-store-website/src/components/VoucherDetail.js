import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useEffect, useState } from "react";

import ProductCard from "./layout/ProductCard";

import {
    FiCopy,
    FiCalendar,
    FiClock,
    FiPercent,
} from "react-icons/fi";

import { HiOutlineTicket } from "react-icons/hi";

import toast from "react-hot-toast";

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

    const copyCode = async (code) => {
        await navigator.clipboard.writeText(code);

        toast.success(`Đã sao chép mã ${code}`);
    };

    if (loading) {
        return (
            <div className="py-20">
                <p className="text-center text-gray-500">
                    Đang tải voucher...
                </p>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="py-20 text-center text-gray-500">
                Không tìm thấy voucher
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                {/* HERO */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-[32px] shadow-xl">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 p-8 md:p-10 text-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <HiOutlineTicket className="text-4xl" />
                                    </div>

                                    <div>
                                        <p className="text-white/80 text-sm">
                                            Voucher giảm giá
                                        </p>

                                        <h1 className="text-4xl font-bold">
                                            -{detail.discount}%
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3">
                                        <FiPercent />

                                        <span className="font-semibold tracking-wide">
                                            {detail.code}
                                        </span>

                                        <button
                                            onClick={() =>
                                                copyCode(detail.code)
                                            }
                                            className="hover:text-cyan-200 transition"
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-medium
                                        ${statusStyle[
                                            getStatus(detail)
                                            ]
                                            }`}
                                    >
                                        {
                                            statusText[
                                            getStatus(detail)
                                            ]
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Thông tin voucher
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3 text-gray-700">
                                <FiCalendar />

                                <span className="font-semibold">
                                    Ngày bắt đầu
                                </span>
                            </div>

                            <p className="text-gray-600">
                                {new Date(
                                    detail.start_date
                                ).toLocaleString("vi-VN")}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3 text-gray-700">
                                <FiClock />

                                <span className="font-semibold">
                                    Ngày kết thúc
                                </span>
                            </div>

                            <p className="text-gray-600">
                                {new Date(
                                    detail.end_date
                                ).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PRODUCTS */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Sản phẩm áp dụng
                    </h2>

                    {detail.products?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {detail.products.map((p) => (
                                <ProductCard key={p.id} item={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            Không có sản phẩm áp dụng
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherDetail;