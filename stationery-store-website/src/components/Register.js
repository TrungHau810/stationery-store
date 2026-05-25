import { useState } from "react";

import Apis, { endpoint } from "../configs/Apis";

import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom";

import {
    FiArrowRight,
    FiCheckCircle,
    FiImage,
    FiLoader,
    FiLock,
    FiMail,
    FiPhone,
    FiUser,
    FiMapPin,
    FiShield,
} from "react-icons/fi";

const Register = () => {
    const [user, setUser] = useState({});

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState(null);

    const [successMessage, setSuccessMessage] =
        useState(null);

    const [showOtpForm, setShowOtpForm] =
        useState(false);

    const [otp, setOtp] = useState("");

    const nav = useNavigate();

    const info_register = [
        {
            label: "Tên đăng nhập",
            name: "username",
            type: "text",
            icon: FiShield,
            required: true,
        },

        {
            label: "Mật khẩu",
            name: "password",
            type: "password",
            icon: FiLock,
            required: true,
        },

        {
            label: "Xác nhận mật khẩu",
            name: "confirm_password",
            type: "password",
            icon: FiLock,
            required: true,
        },

        {
            label: "Họ và tên",
            name: "full_name",
            type: "text",
            icon: FiUser,
            required: true,
        },

        {
            label: "Số điện thoại",
            name: "number_phone",
            type: "text",
            icon: FiPhone,
            required: false,
        },

        {
            label: "Email",
            name: "email",
            type: "email",
            icon: FiMail,
            required: true,
        },

        {
            label: "Địa chỉ",
            name: "address",
            type: "text",
            icon: FiMapPin,
            required: false,
        },
    ];

    const validated = () => {
        if (
            user.password !== user.confirm_password
        ) {
            setMessage("Mật khẩu không khớp");

            return false;
        }

        if (user.password?.length < 6) {
            setMessage(
                "Mật khẩu phải có ít nhất 6 ký tự"
            );

            return false;
        }

        if (
            !/\S+@\S+\.\S+/.test(user.email || "")
        ) {
            setMessage("Email không hợp lệ");

            return false;
        }

        if (
            user.number_phone &&
            !/^\d{10,11}$/.test(
                user.number_phone
            )
        ) {
            setMessage(
                "Số điện thoại không hợp lệ"
            );

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

            let response = await Apis.post(
                endpoint["register"],
                formData
            );

            if (response.status === 201) {
                setSuccessMessage(
                    "Đăng ký thành công! Vui lòng xác thực OTP."
                );

                setShowOtpForm(true);

                await Apis.post(
                    endpoint["send_otp"],
                    {
                        email: user.email,
                    }
                );
            }
        } catch (err) {
            console.error(err);

            if (
                err.response &&
                err.response.data
            ) {
                let errors = err.response.data;

                if (errors.username) {
                    setMessage(
                        "Tên đăng nhập đã tồn tại"
                    );
                } else if (errors.email) {
                    setMessage(
                        "Email đã được sử dụng"
                    );
                }
            } else {
                setMessage("Có lỗi xảy ra");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            let res = await Apis.patch(
                endpoint["verify"],
                {
                    email: user.email,
                    otp_code: otp,
                }
            );

            if (res.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Xác thực thành công",
                    timer: 1800,
                    showConfirmButton: false,
                });

                setTimeout(() => {
                    nav("/login");
                }, 1800);
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "OTP không hợp lệ",
            });
        }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center px-4 py-1">
                <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-2">

                    {/* LEFT SIDE */}
                    <div className="relative hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 p-12 text-white overflow-hidden">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center backdrop-blur mb-8">
                                <FiUser className="text-4xl" />
                            </div>

                            <h2 className="text-4xl font-bold leading-tight mb-5">
                                Chào mừng đến với hệ thống
                            </h2>

                            <p className="text-blue-100 text-lg leading-relaxed mb-10">
                                Tạo tài khoản để trải nghiệm mua sắm,
                                tích điểm và nhận nhiều ưu đãi hấp dẫn.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiCheckCircle />
                                    </div>

                                    <span className="text-blue-50">
                                        Đăng ký nhanh chóng
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiShield />
                                    </div>

                                    <span className="text-blue-50">
                                        Bảo mật thông tin
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiMail />
                                    </div>

                                    <span className="text-blue-50">
                                        Xác thực OTP an toàn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="p-8 lg:p-10 flex items-center">
                        <div className="w-full">

                            {/* MOBILE HEADER */}
                            <div className="lg:hidden text-center mb-8">
                                <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                    <FiUser className="text-3xl" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Đăng ký tài khoản
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Tạo tài khoản để tiếp tục
                                </p>
                            </div>

                            {/* ALERT */}
                            {message && (
                                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {message}
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                                    <FiCheckCircle />
                                    {successMessage}
                                </div>
                            )}

                            {!showOtpForm ? (
                                <form
                                    onSubmit={handleRegister}
                                    className="space-y-4"
                                >
                                    <div className="grid md:grid-cols-2 gap-4">

                                        {info_register.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <div
                                                    key={item.name}
                                                    className={
                                                        item.name === "address"
                                                            ? "md:col-span-2"
                                                            : ""
                                                    }
                                                >
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        {item.label}

                                                        {item.required && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </label>

                                                    <div className="relative">
                                                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                                                        <input
                                                            type={item.type}
                                                            value={
                                                                user[item.name] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setUser({
                                                                    ...user,
                                                                    [item.name]:
                                                                        e.target.value,
                                                                })
                                                            }
                                                            required={item.required}
                                                            className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* AVATAR */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Ảnh đại diện
                                            </label>

                                            <label className="h-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center gap-3 px-4 cursor-pointer hover:border-blue-400 transition">
                                                <FiImage className="text-gray-400" />

                                                <span className="text-sm text-gray-500">
                                                    Chọn ảnh đại diện
                                                </span>

                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(e) =>
                                                        setUser({
                                                            ...user,
                                                            avatar:
                                                                e.target.files[0],
                                                        })
                                                    }
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Các trường có dấu
                                        <span className="text-red-500 mx-1">*</span>
                                        là bắt buộc
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full h-12 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 transition flex items-center justify-center gap-3
                            ${loading
                                                ? "opacity-70 cursor-not-allowed"
                                                : "hover:bg-blue-700"
                                            }`}
                                    >
                                        {loading ? (
                                            <FiLoader className="animate-spin" />
                                        ) : (
                                            <FiArrowRight />
                                        )}

                                        {loading
                                            ? "Đang đăng ký..."
                                            : "Đăng ký"}
                                    </button>
                                </form>
                            ) : (
                                <div className="max-w-md mx-auto space-y-5">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                            <FiMail className="text-3xl" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                            Xác thực OTP
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            Mã OTP đã được gửi tới email của bạn
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value)
                                        }
                                        placeholder="Nhập mã OTP"
                                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-center tracking-[6px] text-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />

                                    <button
                                        onClick={handleVerifyOtp}
                                        className="w-full h-12 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                                    >
                                        Xác thực OTP
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 text-center text-sm text-gray-500">
                                Đã có tài khoản?{" "}
                                <button
                                    onClick={() => nav("/login")}
                                    className="font-semibold text-blue-600 hover:text-blue-700 transition"
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;