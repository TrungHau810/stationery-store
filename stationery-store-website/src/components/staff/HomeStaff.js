import { useContext, useEffect } from "react";
import { roleLabels } from "../Profile";
import { Link } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";

const HomeStaff = () => {

    const [user,] = useContext(MyUserContext);

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) return "Chào buổi sáng";
        if (hour >= 12 && hour < 17) return "Chào buổi trưa";
        if (hour >= 17 && hour < 21) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    useEffect(() => {
        console.log("User nè:", user);
    }, []);

    return (
        <div className="bg-gray-100 flex flex-col items-center py-10 px-4">

            {!user ? (
                <div className="flex items-center justify-center">
                    <p className="text-gray-500">Vui lòng đăng nhập để tiếp tục</p>
                    <Link to="/login" className="ml-4 text-blue-500 hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            ) : <>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Chào mừng bạn đến với cửa hàng văn phòng phẩm
                </h1>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {getGreeting()}, {user.full_name}
                </h3>

                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                    <p className="text-lg text-gray-700 mb-2">
                        <span className="font-semibold">Nhân viên:</span> {user.full_name}
                    </p>
                    <p className="text-lg text-gray-700 mb-2">
                        <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p className="text-lg text-gray-700">
                        <span className="font-semibold">Chức vụ:</span>{" "}
                        {roleLabels[user.role]?.label || "Không xác định"}
                    </p>
                </div>
            </>}
        </div>
    );
};

export default HomeStaff;