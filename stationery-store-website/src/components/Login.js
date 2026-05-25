import { useState, useContext } from "react";
import {
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { FcGoogle } from "react-icons/fc";
import {
    FiShoppingBag,
    FiShield,
    FiArrowRight,
} from "react-icons/fi";

import { MyCartContext, MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import Apis, { authApis, endpoint } from "../configs/Apis";
import cookie from "react-cookies";
import Swal from "sweetalert2";
import { FaHandPeace } from "react-icons/fa";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [, dispatch] = useContext(MyUserContext);
    const [, dispatchCart] = useContext(MyCartContext);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const nav = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!user.username || !user.password) {
            setMessage(
                "Vui lòng nhập tên đăng nhập và mật khẩu."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await Apis.post(
                endpoint["login"],
                {
                    ...user,
                    client_id:
                        process.env.REACT_APP_CLIENT_ID,
                    client_secret:
                        process.env
                            .REACT_APP_CLIENT_SECRET,
                    grant_type: "password",
                }
            );

            cookie.save(
                "token",
                response.data.access_token
            );

            cookie.save(
                "refresh_token",
                response.data.refresh_token
            );

            const res = await authApis().get(
                endpoint["profile"]
            );

            dispatch({
                type: "login",
                payload: res.data,
            });

            const cartRes = await authApis().get(
                endpoint["cart"]
            );

            let count = 0;

            if (cartRes.data.length > 0) {
                cartRes.data[0].items.forEach((item) => {
                    count += item.quantity;
                });
            }

            dispatchCart({
                type: "update",
                payload: count,
            });

            Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công",
                text: "Chào mừng quay trở lại!",
                timer: 1300,
                showConfirmButton: false,
            });

            setTimeout(() => {
                res.data.role === "customer"
                    ? nav("/")
                    : res.data.role === "staff"
                        ? nav("/staff/home")
                        : res.data.role === "manager"
                            ? nav("/manager/home")
                            : nav("/");
            }, 1400);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    setMessage(
                        "Tên đăng nhập hoặc mật khẩu không đúng."
                    );
                }
            } else if (
                err.message === "Network Error"
            ) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi máy chủ",
                    text: "Vui lòng thử lại sau.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center px-4 py-6">

            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[32px] overflow-hidden grid lg:grid-cols-2">

                {/* LEFT SIDE */}
                <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-12 text-white overflow-hidden">

                    {/* BLUR EFFECT */}
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col justify-center">

                        <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-8">
                            <FiShoppingBag className="text-4xl" />
                        </div>

                        <h1 className="text-4xl font-bold leading-tight mb-5">
                            Chào mừng quay trở lại
                        </h1>

                        <p className="text-blue-100 text-lg leading-relaxed mb-10">
                            Đăng nhập để tiếp tục mua sắm,
                            quản lý đơn hàng và nhận ưu đãi
                            dành riêng cho bạn.
                        </p>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <FiShield />
                                </div>

                                <span className="text-blue-50">
                                    Bảo mật thông tin người dùng
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <FiShoppingBag />
                                </div>

                                <span className="text-blue-50">
                                    Theo dõi đơn hàng dễ dàng
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="p-8 lg:p-12 flex items-center">

                    <div className="w-full max-w-md mx-auto">

                        {/* MOBILE ICON */}
                        <div className="lg:hidden flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <LockClosedIcon className="w-8 h-8" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                            Đăng nhập
                        </h2>

                        <p className="text-gray-500 text-center mb-8">
                            Chào mừng bạn quay trở lại <FaHandPeace className="inline-block mx-1 text-blue-500" />
                        </p>

                        {message && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
                                {message}
                            </div>
                        )}

                        {/* FORM */}
                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >

                            {/* USERNAME */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Tên đăng nhập
                                </label>

                                <div className="relative">
                                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />

                                    <input
                                        type="text"
                                        value={
                                            user.username || ""
                                        }
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                username:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Nhập tên đăng nhập"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Mật khẩu
                                </label>

                                <div className="relative">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            user.password ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                password:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Nhập mật khẩu"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* FORGOT PASSWORD */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        nav(
                                            "/reset-password"
                                        )
                                    }
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            {/* LOGIN BUTTON */}
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
                                    <>
                                        <svg
                                            className="w-5 h-5 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4"
                                            ></path>
                                        </svg>

                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        <FiArrowRight />
                                        Đăng nhập
                                    </>
                                )}
                            </button>
                        </form>

                        {/* DIVIDER */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>

                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-3 text-gray-400">
                                    Hoặc tiếp tục với
                                </span>
                            </div>
                        </div>

                        {/* GOOGLE BUTTON */}
                        <button
                            type="button"
                            onClick={() =>
                                Swal.fire({
                                    icon: "info",
                                    title:
                                        "Tính năng đang phát triển",
                                    text: "Đăng nhập Google sẽ sớm được hỗ trợ.",
                                    confirmButtonColor:
                                        "#2563eb",
                                })
                            }
                            className="w-full h-12 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center gap-3"
                        >
                            <FcGoogle className="text-2xl" />

                            <span className="font-medium text-gray-700">
                                Tiếp tục với Google
                            </span>
                        </button>

                        {/* REGISTER */}
                        <p className="text-center text-sm text-gray-500 mt-8">
                            Chưa có tài khoản?{" "}
                            <button
                                onClick={() =>
                                    nav("/register")
                                }
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Đăng ký ngay
                            </button>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;