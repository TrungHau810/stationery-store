import { useState, useEffect, useContext } from "react";
import {
    Bars3Icon,
    ShoppingCartIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import Apis, { endpoint } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import { MyCartContext, MyUserContext } from "../../configs/Contexts";

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [user, dispatch] = useContext(MyUserContext);
    const [cart, dispatchCart] = useContext(MyCartContext);
    const [keyword, setKeyword] = useState("");
    const nav = useNavigate();

    const loadCategories = async () => {
        try {
            const res = await Apis.get(endpoint["category"]);
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi load categories:", err);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const role = user?.role;

    return (
        <header className="sticky top-0 z-50 bg-white transition-shadow duration-300 shadow-sm">
            {/* Top bar */}
            <div className="bg-blue-100 flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 shadow-sm">
                {/* Logo */}
                <button className="flex items-center text-xl font-extrabold text-blue-600 hover:opacity-80 transition" onClick={() => { role === "customer" || role === undefined ? nav("/") : role === "staff" ? nav("/staff/home") : nav("/manager/home") }}>
                    <img src="/store-logo.png" alt="Open Stationery Store" className="h-8 w-8 mr-2" />
                    Open Stationery Store
                </button>

                {/* Search bar */}
                <div className="hidden md:flex flex-1 mx-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && keyword.trim().length > 0) { nav(`/products?keyword=${keyword}`); setKeyword(""); } }}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition" onClick={() => { if (keyword.trim().length > 0) { nav(`/products?keyword=${keyword}`); setKeyword(""); } }}>
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* User & Cart */}
                <div className="flex items-center space-x-2 sm:space-x-4 text-sm font-medium">
                    {user ? (
                        <>
                            <button className="flex items-center space-x-2 hover:opacity-80" onClick={() => nav("/profile")}>
                                <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={user.full_name} className="h-8 w-8 rounded-full" />
                                <span className="hidden sm:inline">{user.full_name || "Người dùng"}</span>
                            </button>
                            <button onClick={() => {
                                dispatch({ type: "logout" });
                                dispatchCart({ type: "clear" });
                                nav("/");
                            }} className="hover:text-blue-500">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => nav("/login")} className="hover:text-blue-500">Đăng nhập</button>
                            <button onClick={() => nav("/register")} className="hover:text-blue-500">Đăng ký</button>
                        </>
                    )}
                    {!user || user?.role === "customer" ? (
                        <button className="relative flex items-center space-x-1 hover:text-blue-500" onClick={() => nav("/cart")}>
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Giỏ hàng</span>
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cart}
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Navigation / Menu */}
            <nav className="bg-blue-50 px-4 sm:px-6 md:px-12 py-2 flex flex-wrap items-center space-x-2 sm:space-x-4 overflow-visible shadow-sm relative">
                {/* Danh mục sản phẩm */}
                <div className="relative group">
                    {/* Nút danh mục */}
                    <button
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition"
                    >
                        <Bars3Icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-700 text-sm sm:text-base">
                            Danh mục sản phẩm
                        </span>
                    </button>

                    {/* Dropdown categories */}
                    <div
                        className="absolute left-0 w-64 bg-white border rounded-lg shadow-lg z-50
  opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
  transition-opacity duration-200"
                    >
                        <ul className="divide-y divide-gray-200">
                            {categories.length > 0 ? (
                                categories.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex justify-between items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                                        onClick={() => nav(`/products?category_id=${c.id}`)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span>{c.icon}</span>
                                            <span className="text-gray-700">{c.name}</span>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500">Không có danh mục</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Các menu khác */}
                {!user || user.role === "customer" ? (
                    <>
                        <button className="px-3 py-2 rounded-lg text-sm sm:text-base hover:bg-blue-100 transition transform hover:scale-105 duration-200" onClick={() => nav("/products")}>
                            Sản phẩm
                        </button>
                        <button className="px-3 py-2 rounded-lg text-sm sm:text-base hover:bg-blue-100 transition transform hover:scale-105 duration-200" onClick={() => nav("/vouchers")}>
                            Khuyến mãi
                        </button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/purchase")}>
                            Lịch sử mua hàng
                        </button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/loyalty-point")}>
                            Lịch sử tích điểm
                        </button>
                    </>
                ) : null}

                {/* Staff menu */}
                {role === "staff" && (
                    <>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/staff/home")}>Trang nhân viên</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/products")}>Sản phẩm</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/staff/receipts")}>Phiếu nhập hàng</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/staff/orders")}>Đơn hàng</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/staff/orders/pending")}>Đơn hàng đang chờ</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/staff/revenue")}>Báo cáo doanh thu</button>
                    </>
                )}

                {/* Manager menu */}
                {role === "manager" && (
                    <>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/home")}>Trang quản lý</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/products")}>Sản phẩm</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/receipts")}>Phiếu nhập hàng</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/users")}>Quản lý người dùng</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/orders")}>Đơn hàng</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/orders/pending")}>Đơn hàng đang chờ</button>
                        <button className="px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base" onClick={() => nav("/manager/products/pending")}>Duyệt sản phẩm</button>
                    </>
                )}
            </nav>
        </header >
    );
};

export default Header;