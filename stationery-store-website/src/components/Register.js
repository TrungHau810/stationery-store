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
        if (user.number_phone && !/^\d{10,11}$/.test(user.number_phone)) {
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
                if (key !== "confirm_password") formData.append(key, user[key]);
            }
            formData.append("role", "customer");

            let response = await Apis.post(endpoint["register"], formData);
            if (response.status === 201) {
                setSuccessMessage("Đăng ký thành công! Vui lòng xác thực OTP.");
                setShowOtpForm(true);
                await Apis.post(endpoint['send_otp'], { email: user.email });
            } else setMessage("Đăng ký thất bại!");
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                let errors = err.response.data;
                if (errors.username) setMessage("Tên đăng nhập đã tồn tại!");
                else if (errors.email) setMessage("Email đã được sử dụng!");
            } else setMessage("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            let res = await Apis.patch(endpoint["verify"], { email: user.email, otp_code: otp });
            if (res.status === 200) {
                Swal.fire({ icon: "success", title: "Xác thực thành công", timer: 2000 });
                setTimeout(() => nav("/login"), 2000);
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "OTP không hợp lệ" });
        }
    };

    return (
        <div className="flex justify-center items-start bg-blue-50 p-6 pt-10">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl pl-8 pr-8 pt-2 pb-10">
                <div className="flex flex-col items-center mb-6">
                    <FaUserPlus className="text-blue-600 text-4xl mb-2" />
                    <h3 className="text-2xl font-bold text-center">Đăng ký tài khoản</h3>
                    <p className="text-center text-gray-600 text-sm">Nhập thông tin để tạo tài khoản</p>
                </div>

                {message && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{message}</div>}
                {successMessage && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">{successMessage}</div>}

                {!showOtpForm ? (
                    <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
                        {info_register.map((item) => (
                            <div key={item.name} className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {item.label} {item.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={item.type}
                                    value={user[item.name] || ""}
                                    onChange={(e) => setUser({ ...user, [item.name]: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={item.required}
                                />
                            </div>
                        ))}

                        {/* Avatar */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                            <input
                                type="file"
                                onChange={(e) => setUser({ ...user, avatar: e.target.files[0] })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                        </div>
                        <span className="text-gray-500 text-sm col-span-2">* Các trường có dấu <span className="text-red-500">*</span> là bắt buộc</span>
                        <button
                            type="submit"
                            disabled={loading}
                            className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-center">Nhập OTP</h4>
                        <input
                            type="text"
                            placeholder="Nhập OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                            Xác thực OTP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;