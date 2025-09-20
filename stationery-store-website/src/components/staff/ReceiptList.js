import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApis, endpoint } from "../../configs/Apis";
import { ArchiveBoxIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ReceiptDetail from "../layout/receipt/ReceiptDetail";
import { MyUserContext } from "../../configs/Contexts";

const ReceiptList = () => {
    const [user,] = useContext(MyUserContext);
    const [receipts, setReceipts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchReceipts = async () => {
        try {
            const response = await authApis().get(endpoint["goods_receipt"]);
            setReceipts(response.data);
        } catch (error) {
            console.error("Error fetching receipts:", error);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    return (
        <div className="p-6">
            {/* Nút tạo phiếu nhập */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="flex items-center text-2xl font-bold text-gray-800 gap-2">
                    <ArchiveBoxIcon className="h-7 w-7 text-blue-600" />
                    Danh sách phiếu nhập hàng
                </h1>
                <button
                    onClick={() => {user.role === "manager" ? navigate("/manager/receipts/new") : navigate("/staff/receipts/new")}}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    Tạo phiếu nhập mới
                </button>
            </div>

            {/* Bảng danh sách */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                        <tr>
                            <th className="py-3 px-4 text-left">Mã phiếu</th>
                            <th className="py-3 px-4 text-left">Mã NCC</th>
                            <th className="py-3 px-4 text-left">Tên NCC</th>
                            <th className="py-3 px-4 text-left">Ngày tạo</th>
                            <th className="py-3 px-4 text-left">Mã NV</th>
                            <th className="py-3 px-4 text-left">Người tạo</th>
                            <th className="py-3 px-4 text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y divide-gray-200">
                        {receipts.map((receipt, idx) => (
                            <tr
                                key={receipt.id}
                                className={`hover:bg-gray-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                    }`}
                            >
                                <td className="py-2 px-4 font-medium">#{receipt.id}</td>
                                <td className="py-2 px-4">#{receipt.supplier.id}</td>
                                <td className="py-2 px-4">{receipt.supplier.name}</td>
                                <td className="py-2 px-4">
                                    {new Date(receipt.created_date).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="py-2 px-4">#{receipt.user.id}</td>
                                <td className="py-2 px-4">{receipt.user.full_name}</td>
                                <td className="py-2 px-4 text-center">
                                    <button
                                        className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                                        onClick={() => {
                                            setSelectedReceipt(receipt);
                                            setShowModal(true);
                                        }}
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal hiển thị chi tiết */}
            {showModal && selectedReceipt && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] overflow-auto relative">
                        {/* Nút đóng */}
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowModal(false)}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {/* Nội dung chi tiết */}
                        <div className="p-6">
                            <ReceiptDetail receipt={selectedReceipt} showModal={showModal} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptList;