import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import { roleLabels } from "../Profile";


const UserManage = () => {

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        let response = await authApis().get(endpoint["all_user"]);
        setUsers(response.data);
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Quản lý người dùng</h1>
                <div className="bg-white shadow-md rounded-lg p-6 w-full">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">ID</th>
                                <th className="py-3 px-6 text-left">Tên đầy đủ</th>
                                <th className="py-3 px-6 text-left">Tên đăng nhập</th>
                                <th className="py-3 px-6 text-left">Số điện thoại</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-left">Địa chỉ</th>
                                <th className="py-3 px-6 text-left">Vai trò</th>
                                {/* <th className="py-3 px-6 text-left">Trạng thái</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="text-gray-600 text-sm font-light border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left">{user.id}</td>
                                    <td className="py-3 px-6 text-left">{user.full_name}</td>
                                    <td className="py-3 px-6 text-left">{user.username}</td>
                                    <td className="py-3 px-6 text-left">{user.number_phone}</td>
                                    <td className="py-3 px-6 text-left">{user.email}</td>
                                    <td className="py-3 px-6 text-left">{user.address}</td>
                                    <td className={`py-3 px-6 text-left ${roleLabels[user.role]?.color || "text-gray-600"}`}>
                                        {roleLabels[user.role]?.label || "Không xác định"}
                                    </td>
                                    {/* <td className="py-3 px-6 text-left">{user.last_login.toLocaleString({"hoủ"})}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default UserManage;
