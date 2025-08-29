import { useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

const Register = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const nav = useNavigate();

    const info_register = [
        { label: "Tên đăng nhập", name: "username", type: "text", required: true },
        { label: "Mật khẩu", name: "password", type: "password", required: true },
        { label: "Xác nhận mật khẩu", name: "confirm_password", type: "password", required: true },
        { label: "Họ và tên", name: "full_name", type: "text", required: true },
        { label: "Số điện thoại", name: "number_phone", type: "text", required: false },
        { label: "Email", name: "email", type: "email", required: true },
        { label: "Địa chỉ", name: "address", type: "text", required: false },
    ];


    const validated = () => {
        if (user.password !== user.confirm_password) {
            setMessage("Mật khẩu không khớp");
            return false;
        }
        if (user.password?.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(user.email || "")) {
            setMessage("Email không hợp lệ");
            return false;
        }
        if (!/^\d{10,11}$/.test(user.number_phone || "")) {
            setMessage("Số điện thoại không hợp lệ");
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validated()) return;

        try {
            setLoading(true);
            setMessage(null);

            const formData = new FormData();
            for (let key in user) {
                if (key !== "confirm_password") {
                    formData.append(key, user[key]);
                }
            }
            formData.append("role", "customer");

            let response = await Apis.post(endpoint["register"], formData);
            if (response.status === 201) {
                setSuccessMessage("Đăng ký thành công! Vui lòng xác thực OTP.");
                setEmail(user.email);
                setShowOtpForm(true);

                Swal.fire({
                    icon: "success",
                    title: "Đăng ký thành công",
                    text: "Chúng tôi đã gửi mã OTP tới email của bạn.",
                    timer: 4000,
                    showConfirmButton: false,
                });

                await Apis.post(endpoint['send_otp'], { email: user.email });
            } else {
                setMessage("Đăng ký thất bại! Vui lòng thử lại.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            let res = await Apis.patch(endpoint["verify"], {
                email: user.email,
                otp_code: otp
            });
            if (res.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Xác thực thành công",
                    text: "Tài khoản đã được kích hoạt. Hãy đăng nhập!",
                    timer: 3000,
                });
                setTimeout(() => nav("/login"), 3000);
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: err.response?.data?.detail || "OTP không hợp lệ",
            });
        }
    };

    const handleResendOtp = async () => {
        try {
            let res = await Apis.post(endpoint["resend-otp"], { email: user.email });
            if (res.status === 200) {
                Swal.fire({
                    icon: "info",
                    title: "OTP đã được gửi lại",
                    text: "Vui lòng kiểm tra email của bạn.",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Không thể gửi lại OTP",
                text: err.response?.data?.detail || "Có lỗi xảy ra",
            });
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 pt-16">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 transition-all duration-300 hover:shadow-2xl">

                <div className="flex items-center justify-center mb-6">
                    <FaUserPlus className="text-blue-600 text-6xl" /> {/* icon to hơn */}
                </div>

                <h3 className="text-3xl font-bold text-center mb-4">Đăng ký tài khoản</h3>

                <p className="text-center text-gray-600 mb-8">
                    Đăng ký tài khoản để mua hàng và nhận ưu đãi tại cửa hàng của chúng tôi
                </p>

                {message && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
                        {message}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
                        {successMessage}
                    </div>
                )}

                {!showOtpForm ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-6">

                            {/* Phần 1: Thông tin bắt buộc */}
                            <div className="bg-blue-50 p-4 rounded-lg shadow-inner space-y-4">
                                <h4 className="text-lg font-semibold mb-2">Thông tin bắt buộc</h4>
                                {info_register
                                    .filter(item => item.required)
                                    .map(item => (
                                        <div key={item.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {item.label} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type={item.type}
                                                name={item.name}
                                                required
                                                value={user[item.name] || ""}
                                                onChange={(e) => setUser({ ...user, [item.name]: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            />
                                        </div>
                                    ))}
                            </div>

                            {/* Phần 2: Thông tin không bắt buộc */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-4">
                                <h4 className="text-lg font-semibold mb-2">Thông tin không bắt buộc</h4>
                                {info_register
                                    .filter(item => !item.required)
                                    .map(item => (
                                        <div key={item.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {item.label}
                                            </label>
                                            <input
                                                type={item.type}
                                                name={item.name}
                                                value={user[item.name] || ""}
                                                onChange={(e) => setUser({ ...user, [item.name]: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                            />
                                        </div>
                                    ))}

                                {/* Avatar */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                                    <input
                                        type="file"
                                        name="avatar"
                                        onChange={(e) => setUser({ ...user, avatar: e.target.files[0] })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-center">Nhập mã OTP</h4>
                        <input
                            type="text"
                            placeholder="Nhập OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleVerifyOtp}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Xác thực OTP
                        </button>
                        <button
                            onClick={handleResendOtp}
                            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            Gửi lại OTP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;