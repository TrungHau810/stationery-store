import { Link } from "react-router-dom";
import {
    FiHome,
    FiArrowLeft,
    FiSearch,
} from "react-icons/fi";
import { TbFaceIdError } from "react-icons/tb";

const NotFound = () => {
    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10 overflow-hidden">

            <div className="relative w-full max-w-5xl rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden">

                {/* Glow background */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"></div>

                <div className="relative z-10 grid md:grid-cols-2 items-center">

                    {/* LEFT CONTENT */}
                    <div className="p-8 md:p-12 lg:p-16">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 text-sm font-semibold mb-6">
                            <FiSearch />
                            Không tìm thấy trang
                        </div>

                        <h1 className="text-[90px] lg:text-[120px] font-black leading-none bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            404
                        </h1>

                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4 mb-4">
                            Trang không tồn tại
                        </h2>

                        <p className="text-gray-500 leading-relaxed text-base lg:text-lg mb-8 max-w-lg">
                            Có thể liên kết đã bị thay đổi, trang đã bị xóa
                            hoặc URL bạn nhập không chính xác.
                        </p>

                        <div className="flex flex-wrap gap-4">

                            <Link
                                to="/"
                                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200"
                            >
                                <FiHome className="group-hover:scale-110 transition-transform" />
                                Về trang chủ
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                            >
                                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                Quay lại
                            </button>

                        </div>
                    </div>

                    {/* RIGHT VISUAL */}
                    <div className="hidden md:flex items-center justify-center p-10">

                        <div className="relative">

                            {/* Main Circle */}
                            <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_20px_60px_rgba(37,99,235,0.35)]">

                                <div className="w-[240px] h-[240px] rounded-full bg-white flex items-center justify-center shadow-inner">

                                    <TbFaceIdError
                                        size={140}
                                        className="text-red-500"
                                    />

                                </div>
                            </div>

                            {/* Floating card */}
                            <div className="absolute -top-4 -left-8 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3">
                                <p className="text-sm font-semibold text-gray-700">
                                    Error 404
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Page not found
                                </p>
                            </div>

                            <div className="absolute bottom-2 -right-8 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3">
                                <p className="text-sm font-semibold text-gray-700">
                                    Invalid URL
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Please check again
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default NotFound;