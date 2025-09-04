import { useState, useContext } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { MyUserContext } from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import Apis, { authApis, endpoint } from "../configs/Apis";
import cookie from "react-cookies";
import Swal from "sweetalert2";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [, dispatch] = useContext(MyUserContext);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const nav = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!user.username || !user.password) {
            setMessage("Vui lòng nhập tên đăng nhập và mật khẩu.");
            return;
        }
        try {
            setLoading(true);
            const response = await Apis.post(endpoint['login'], {
                ...user,
                client_id: "H9NEh1H8FbCa6g7LaUbQJwUJHrGx5mqkMbJB7wW7",
                client_secret: "MLXdmCFbDWcf8d4i3uRheC6IUeJjPeFcjC59ztuLMDllTjbEiQl9gPbwt8dnZiOThix2AtlvbOHaEzsHDZG3WvkKZlxbHlTMv8QuLcBJS2VRzE4933FObB59zP4FBswD",
                grant_type: "password",
            });
            cookie.save("token", response.data.access_token);

            const res = await authApis().get(endpoint['profile']);
            dispatch({ type: "login", payload: res.data });

            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công',
                text: 'Chào mừng bạn đến với cửa hàng của chúng tôi!',
                timer: 2000,
                showConfirmButton: false
            });
            setTimeout(() => { user.role === "customer" ? nav("/staff/home") : nav("/") }, 2000);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    if (err.response.data.error === "invalid_request")
                        setMessage("Vui lòng nhập tên đăng nhập và mật khẩu.");
                    else if (err.response.data.error === "invalid_grant")
                        setMessage("Tài khoản chưa xác thực");
                } else if (err.response.status === 401) {
                    setMessage("Tài khoản của bạn đã bị vô hiệu hóa.");
                } else {
                    setMessage("Đã có lỗi xảy ra, vui lòng thử lại sau.");
                }
            } else if (err.message === "Network Error") {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi máy chủ',
                    text: 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-blue-50 pt-24 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-full">
                        <LockClosedIcon className="h-6 w-6" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>

                {message && <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded text-center">{message}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={user.username || ""}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Tên đăng nhập"
                            required
                        />
                    </div>

                    <div className="relative">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={user.password || ""}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Mật khẩu"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="text-sm text-right">
                        <button type="button" className="text-blue-500 hover:underline" onClick={() => nav("/reset-password")}>
                            Quên mật khẩu?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Chưa có tài khoản?{" "}
                    <button className="text-blue-500 font-medium hover:underline" onClick={() => nav("/register")}>
                        Đăng ký ngay
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;