import { useContext, useEffect, useState } from "react";

import { MyUserContext } from "../configs/Contexts";

import { authApis, endpoint } from "../configs/Apis";

import Swal from "sweetalert2";

import ChangePassword from "./ChangePassword";

import {
    FiCamera,
    FiSave,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiUser,
    FiShield,
} from "react-icons/fi";

export const roleLabels = {
    customer: {
        label: "Khách hàng",
        color: "bg-blue-100 text-blue-700",
    },

    staff: {
        label: "Nhân viên",
        color: "bg-green-100 text-green-700",
    },

    admin: {
        label: "Quản trị viên",
        color: "bg-red-100 text-red-700",
    },

    manager: {
        label: "Quản lý cửa hàng",
        color: "bg-purple-100 text-purple-700",
    },
};

const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);

    const [loading, setLoading] = useState(false);

    const [showChangePasswordModal, setShowChangePasswordModal] =
        useState(false);

    const [info, setInfo] = useState({
        full_name: "",
        email: "",
        number_phone: "",
        address: "",
        avatar: null,
    });

    useEffect(() => {
        if (user) {
            setInfo({
                full_name: user.full_name || "",
                email: user.email || "",
                number_phone: user.number_phone || "",
                address: user.address || "",
                avatar: user.avatar || null,
            });
        }
    }, [user]);

    const updateProfile = async () => {
        try {
            setLoading(true);

            const changedFields = {};

            Object.keys(info).forEach((key) => {
                if (
                    key === "avatar" &&
                    info.avatar instanceof File
                ) {
                    changedFields[key] = info[key];
                } else if (info[key] !== user[key]) {
                    changedFields[key] = info[key];
                }
            });

            if (Object.keys(changedFields).length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "Không có thay đổi",
                    text: "Bạn chưa chỉnh sửa thông tin nào.",
                    confirmButtonColor: "#2563EB",
                });

                return;
            }

            const formData = new FormData();

            for (const key in changedFields) {
                formData.append(key, changedFields[key]);
            }

            const response = await authApis().patch(
                endpoint["profile"],
                formData
            );

            setInfo({
                ...info,
                ...response.data,
            });

            dispatch({
                type: "update",
                payload: response.data,
            });

            Swal.fire({
                icon: "success",
                title: "Cập nhật thành công",
                text: "Thông tin tài khoản đã được cập nhật.",
                confirmButtonColor: "#2563EB",
            });
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Cập nhật thất bại",
                text: "Có lỗi xảy ra. Vui lòng thử lại.",
                confirmButtonColor: "#DC2626",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Vui lòng đăng nhập
                    </h2>

                    <p className="text-gray-500">
                        Bạn cần đăng nhập để xem hồ sơ cá nhân.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 md:p-6">
                {/* HERO */}
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-xl mb-8">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            {/* AVATAR */}
                            <div className="relative group">
                                <img
                                    src={
                                        info.avatar instanceof File
                                            ? URL.createObjectURL(
                                                info.avatar
                                            )
                                            : info.avatar ||
                                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
                                />

                                <label className="absolute bottom-3 right-3 w-11 h-11 rounded-2xl bg-white text-blue-600 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setInfo({
                                                ...info,
                                                avatar:
                                                    e.target.files[0],
                                            })
                                        }
                                    />

                                    <FiCamera />
                                </label>
                            </div>

                            {/* INFO */}
                            <div className="text-white flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <h1 className="text-4xl font-bold">
                                        {info.full_name ||
                                            "Người dùng"}
                                    </h1>

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md
                                        ${roleLabels[user.role]
                                                ?.color ||
                                            "bg-white/20 text-white"
                                            }`}
                                    >
                                        {roleLabels[user.role]
                                            ?.label ||
                                            "Không xác định"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-white/90">
                                    <FiMail />

                                    <span>{info.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    {/* HEADER */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <FiUser className="text-blue-600 text-xl" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Thông tin cá nhân
                                </h2>

                                <p className="text-gray-500 text-sm">
                                    Cập nhật thông tin tài khoản
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* FULL NAME */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiUser />
                                    Họ và tên
                                </label>

                                <input
                                    type="text"
                                    value={info.full_name}
                                    onChange={(e) =>
                                        setInfo({
                                            ...info,
                                            full_name:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            {/* USERNAME */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiShield />
                                    Tên đăng nhập
                                </label>

                                <input
                                    type="text"
                                    value={user.username}
                                    readOnly
                                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-100 px-5 text-gray-500"
                                />
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiMail />
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={info.email}
                                    readOnly
                                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-100 px-5 text-gray-500"
                                />
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiPhone />
                                    Số điện thoại
                                </label>

                                <input
                                    type="text"
                                    value={info.number_phone}
                                    onChange={(e) =>
                                        setInfo({
                                            ...info,
                                            number_phone:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            {/* ADDRESS */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FiMapPin />
                                    Địa chỉ
                                </label>

                                <input
                                    type="text"
                                    value={info.address}
                                    onChange={(e) =>
                                        setInfo({
                                            ...info,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowChangePasswordModal(
                                        true
                                    )
                                }
                                className="h-14 px-6 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2"
                            >
                                <FiLock />

                                Đổi mật khẩu
                            </button>

                            <button
                                onClick={updateProfile}
                                disabled={loading}
                                className={`h-14 px-8 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 transition flex items-center justify-center gap-3
                                ${loading
                                        ? "opacity-70 cursor-not-allowed"
                                        : "hover:bg-blue-700"
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FiSave />
                                )}

                                {loading
                                    ? "Đang lưu..."
                                    : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showChangePasswordModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg">
                        <ChangePassword
                            onClose={() =>
                                setShowChangePasswordModal(false)
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;