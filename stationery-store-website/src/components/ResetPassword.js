import { useState } from "react";
import Swal from "sweetalert2";
import Apis, { endpoint } from "../configs/Apis";
import { FiMail, FiLock, FiShield } from "react-icons/fi"; // icon đẹp hơn
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    // Bước 1: gửi OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            setLoading(true);
            await Apis.post(endpoint["send_otp"], { email });
            Swal.fire({
                icon: "success",
                title: "Gửi OTP thành công",
                text: "Vui lòng kiểm tra email để nhận mã OTP.",
            });
            setStep(2);
        } catch {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Gửi OTP thất bại, vui lòng thử lại.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: xác nhận OTP và đặt mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword) return;
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
            });
            return;
        }

        try {
            setLoading(true);
            await Apis.patch(endpoint["reset_password"], {
                email,
                otp_code: otp,
                new_password: newPassword,
            });
            Swal.fire({
                icon: "success",
                title: "Đặt lại mật khẩu thành công",
                text: "Bạn có thể đăng nhập với mật khẩu mới.",
            });
            setEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            nav("/login");
        } catch(err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "OTP không hợp lệ hoặc đã hết hạn, vui lòng thử lại.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
            <form className="w-full max-w-md bg-white p-8 m-2 rounded-2xl shadow-lg">
                {/* Tiêu đề */}
                <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
                    {step === 1 ? "Đặt lại mật khẩu" : "Xác nhận OTP"}
                </h2>
                <p className="mb-6 text-center text-gray-500 text-sm">
                    {step === 1
                        ? "Nhập email để nhận mã OTP đặt lại mật khẩu."
                        : "Nhập OTP và tạo mật khẩu mới của bạn."}
                </p>

                {/* Step Indicator */}
                <div className="flex justify-center mb-6 space-x-2">
                    <div
                        className={`w-3 h-3 rounded-full ${step === 1 ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    />
                    <div
                        className={`w-3 h-3 rounded-full ${step === 2 ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    />
                </div>

                {/* Form Step 1 */}
                {step === 1 && (
                    <>
                        <label className="block mb-2 font-medium text-gray-700">
                            Email
                        </label>
                        <div className="flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <FiMail className="text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                className="w-full px-2 py-2 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>
                    </>
                )}

                {/* Form Step 2 */}
                {step === 2 && (
                    <>
                        <label className="block mb-2 font-medium text-gray-700">
                            Mã OTP
                        </label>
                        <div className="flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <FiShield className="text-gray-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Nhập mã OTP"
                                className="w-full px-2 py-2 outline-none"
                                required
                            />
                        </div>

                        <label className="block mb-2 font-medium text-gray-700">
                            Mật khẩu mới
                        </label>
                        <div className="flex items-center border rounded-lg px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <FiLock className="text-gray-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                className="w-full px-2 py-2 outline-none"
                                required
                            />
                        </div>

                        <label className="block mb-2 font-medium text-gray-700">
                            Xác nhận mật khẩu
                        </label>
                        <div className="flex items-center border rounded-lg px-3 mb-6 focus-within:ring-2 focus-within:ring-blue-500">
                            <FiLock className="text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full px-2 py-2 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xác nhận..." : "Đặt lại mật khẩu"}
                        </button>
                    </>
                )}

                {/* Link quay lại */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    <a href="/login" className="text-blue-600 hover:underline">
                        Quay lại đăng nhập
                    </a>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;