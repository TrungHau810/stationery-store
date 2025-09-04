import { useEffect } from "react";
import { HiX } from "react-icons/hi";

const ViewImage = ({ img, onClose }) => {
    useEffect(() => {
        // Khi modal mở, chặn scroll body
        document.body.style.overflow = "hidden";
        return () => {
            // Khi modal đóng, trả lại scroll
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose} // click ra ngoài đóng
        >
            <div
                className="relative"
                onClick={(e) => e.stopPropagation()} // ngăn click vào hình đóng modal
            >
                <img
                    src={img}
                    alt="View"
                    className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md transition"
                >
                    <HiX className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ViewImage;