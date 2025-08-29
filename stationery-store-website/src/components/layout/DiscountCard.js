import { useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

const DiscountCard = ({ discount }) => {

    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(discount.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-stretch mb-3 overflow-hidden rounded-lg shadow border bg-white">
            {/* Cột trái - % giảm */}
            <div className="bg-red-500 text-white flex flex-col items-center justify-center w-28 relative">
                <span className="text-2xl font-extrabold leading-none">
                    {discount.discount}%
                </span>
                <span className="text-xs uppercase mt-1 tracking-wide">Giảm</span>

                {/* Vạch trắng chia 2 cột */}
                <div className="absolute top-0 right-0 w-[2px] h-full bg-white"></div>
            </div>

            {/* Cột phải - thông tin */}
            <div className="flex-1 flex flex-col justify-between px-4 py-3">
                <div>
                    <p className="font-semibold text-gray-800">
                        Mã: <span className="text-blue-600">{discount.code}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Hiệu lực:{" "}
                        {new Date(discount.start_date).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(discount.end_date).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>

                <button
                    onClick={copyCode}
                    className="self-end mt-3 flex items-center gap-1 text-sm px-3 py-1 rounded border border-red-500 text-red-500 hover:bg-red-50 transition"
                >
                    {copied ? (
                        <>
                            <FaCheck /> Đã copy
                        </>
                    ) : (
                        <>
                            <FaCopy /> Copy mã
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DiscountCard;
