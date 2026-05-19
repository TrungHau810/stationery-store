import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
    return (
        <div className="flex items-center justify-center py-20 bg-gray-50 px-4">

            <div className="text-center max-w-md">

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <FiAlertTriangle className="text-red-500 text-3xl" />
                    </div>
                </div>

                {/* Code */}
                <h1 className="text-6xl font-extrabold text-gray-800 mb-2">
                    404
                </h1>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    Opps! Không tìm thấy trang
                </h2>

                {/* Description */}
                <p className="text-gray-500 mb-6">
                    Trang bạn đang truy cập không tồn tại hoặc đã bị di chuyển.
                </p>

                {/* Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <FiHome />
                    Về trang chủ
                </Link>

            </div>
        </div>
    );
};

export default NotFound;