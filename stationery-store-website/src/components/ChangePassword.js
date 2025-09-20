import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { authApis, endpoint } from "../configs/Apis";

const ChangePassword = ({ onClose }) => {
    const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm_password: "" });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (passwords.new_password !== passwords.confirm_password) {
            Swal.fire({ icon: "warning", title: "Mật khẩu không khớp", text: "Vui lòng kiểm tra lại." });
            return;
        }
        try {
            setLoading(true);
            await authApis().patch(endpoint["change_password"], {
                current_password: passwords.old_password,
                new_password: passwords.new_password,
            });
            Swal.fire({ icon: "success", title: "Đổi mật khẩu thành công" });
            onClose();
            setPasswords({ old_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Đổi mật khẩu thất bại", text: err.response.data.detail });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FaTimes />
                </button>
                <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>
                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="Mật khẩu cũ"
                        value={passwords.old_password}
                        onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={passwords.new_password}
                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={passwords.confirm_password}
                        onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white py-2 rounded-lg ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
                    >
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;