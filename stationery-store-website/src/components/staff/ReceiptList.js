import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm hook điều hướng
import { authApis, endpoint } from "../../configs/Apis";
import { ArchiveBoxIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const ReceiptList = () => {
    const [receipts, setReceipts] = useState([]);
    const [users, setUsers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate(); // ✅ dùng để chuyển trang

    const fetchReceipts = async () => {
        try {
            const response = await authApis().get(endpoint["goods_receipt"]);
            setReceipts(response.data);
        } catch (error) {
            console.error("Error fetching receipts:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authApis().get(endpoint["all_user"]);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await authApis().get(endpoint["suppliers"]);
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    useEffect(() => {
        fetchReceipts();
        fetchUsers();
        fetchSuppliers();
    }, []);

    return (
        <div className="p-6">
            {/* 🔹 Nút tạo phiếu nhập */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="flex items-center text-2xl font-bold text-gray-800 gap-2">
                    <ArchiveBoxIcon className="h-7 w-7 text-blue-600" />
                    Danh sách phiếu nhập hàng
                </h1>
                <button
                    onClick={() => navigate("/staff/receipts/new")}
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
                                <td className="py-2 px-4 font-medium">{receipt.id}</td>
                                <td className="py-2 px-4">{receipt.supplier || "Không có"}</td>
                                <td className="py-2 px-4">
                                    {suppliers.find((s) => s.id === receipt.supplier)?.name ||
                                        "Không có"}
                                </td>
                                <td className="py-2 px-4">
                                    {receipt.created_date
                                        ? new Date(receipt.created_date).toLocaleString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Không có"}
                                </td>
                                <td className="py-2 px-4">{receipt.user || "Không có"}</td>
                                <td className="py-2 px-4">
                                    {users.find((u) => u.id === receipt.user)?.full_name ||
                                        "Không có"}
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <button className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition">
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReceiptList;