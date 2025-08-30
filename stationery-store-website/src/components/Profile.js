import { useContext, useState, useEffect } from "react";
import { MyUserContext } from "../configs/Contexts";
import { FaEdit, FaSave } from "react-icons/fa";
import { authApis, endpoint } from "../configs/Apis";
import Swal from "sweetalert2";


const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const roleLabels = {
        customer: { label: "Khách hàng", color: "text-blue-600 font-semibold" },
        staff: { label: "Nhân viên", color: "text-green-600 font-semibold" },
        admin: { label: "Quản trị viên", color: "text-red-600 font-bold" },
        manager: { label: "Quản lý cửa hàng", color: "text-purple-600 font-semibold" },
    };
    const role = roleLabels[user.role] || { label: "Không xác định", color: "text-gray-500" };
    const [info, setInfo] = useState({
        full_name: "",
        email: "",
        number_phone: "",
        address: "",
        avatar: null,
    });
    const [loading, setLoading] = useState(false);

    // Khởi tạo info từ user
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

            // Lọc ra chỉ những field thay đổi
            const changedFields = {};
            Object.keys(info).forEach((key) => {
                if (key === "avatar" && info.avatar instanceof File) {
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
                });
                return;
            }

            const formData = new FormData();
            for (const key in changedFields) {
                formData.append(key, changedFields[key]);
            }

            console.log("Updating profile with changed fields:", changedFields);

            let response = await authApis().patch(endpoint["profile"], formData);

            setInfo({
                ...info,
                ...response.data
            });

            dispatch({ type: "update", payload: response.data });

            Swal.fire({
                icon: "success",
                title: "Cập nhật thành công",
                text: "Thông tin của bạn đã được cập nhật.",
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            Swal.fire({
                icon: "error",
                title: "Cập nhật thất bại",
                text: "Có lỗi xảy ra, vui lòng thử lại.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative group">
                        <img
                            src={
                                info.avatar instanceof File
                                    ? URL.createObjectURL(info.avatar)
                                    : info.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt="Avatar"
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition flex items-center justify-center">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                    setInfo({ ...info, avatar: e.target.files[0] })
                                }
                            />
                            <FaEdit size={16} />
                        </label>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">
                        {info.full_name || "Người dùng"}
                    </h2>
                    <p className="text-gray-500">{info.email}</p>
                    <p className={role.color}>{role.label}</p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={info.full_name}
                            onChange={(e) =>
                                setInfo({ ...info, full_name: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={info.email}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="number_phone"
                            value={info.number_phone}
                            onChange={(e) =>
                                setInfo({ ...info, number_phone: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={info.address}
                            onChange={(e) =>
                                setInfo({ ...info, address: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        />
                    </div>

                    {/* Button Save */}
                    <div className="flex justify-end">
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 
                ${loading ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
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
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                            ) : (
                                <FaSave className="transition-transform duration-200 hover:scale-110" />
                            )}
                            <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
