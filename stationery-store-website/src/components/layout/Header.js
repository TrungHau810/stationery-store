import { useState, useEffect, useContext } from "react";
import {
    Bars3Icon,
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";
import Apis, { endpoint } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import { MyCartContext, MyUserContext } from "../../configs/Contexts";

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [user, dispatch] = useContext(MyUserContext);
    const [cart, dispatchCart] = useContext(MyCartContext);
    const [keyword, setKeyword] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const nav = useNavigate();

    const role = user?.role;

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

    const handleSearch = () => {
        if (keyword.trim()) {
            nav(`/products?keyword=${keyword}`);
            setKeyword("");
            setShowSearch(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 border-b relative">
                {/* Logo */}
                <button
                    className="flex items-center text-lg sm:text-xl font-bold text-blue-600 hover:opacity-80 transition"
                    onClick={() => {
                        role === "customer" || role === undefined
                            ? nav("/")
                            : role === "staff"
                                ? nav("/staff/home")
                                : nav("/manager/home");
                    }}
                >
                    Open Stationery Store
                </button>

                {/* Search bar desktop */}
                <div className="hidden md:flex flex-1 mx-6">
                    <div className="relative w-full max-w-lg">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        />
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                            onClick={handleSearch}
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 text-sm font-medium">
                    {/* Mobile search button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-blue-600"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <MagnifyingGlassIcon className="h-6 w-6" />
                    </button>

                    {/* User */}
                    {user ? (
                        <>
                            <button
                                className="flex items-center space-x-2 hover:opacity-80"
                                onClick={() => nav("/profile")}
                            >
                                <img
                                    src={
                                        user.avatar ||
                                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt={user.full_name}
                                    className="h-8 w-8 rounded-full border"
                                />
                                <span className="hidden sm:inline">
                                    {user.full_name || "Người dùng"}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    dispatch({ type: "logout" });
                                    dispatchCart({ type: "clear" });
                                    nav("/");
                                }}
                                className="text-gray-600 hover:text-blue-600 transition"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => nav("/login")}
                                className="text-gray-600 hover:text-blue-600 transition"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => nav("/register")}
                                className="text-gray-600 hover:text-blue-600 transition"
                            >
                                Đăng ký
                            </button>
                        </>
                    )}

                    {/* Cart */}
                    {!user || user?.role === "customer" ? (
                        <button
                            className="relative flex items-center hover:text-blue-600 transition"
                            onClick={() => nav("/cart")}
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            {cart > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cart}
                                </span>
                            )}
                        </button>
                    ) : null}

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-blue-600"
                        onClick={() => setShowMenu(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                </div>

                {/* Mobile search bar */}
                {showSearch && (
                    <div className="absolute top-full left-0 w-full bg-white border-t p-3 md:hidden">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                )}
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex bg-blue-50 px-6 md:px-12 py-2 items-center gap-4 text-sm">
                {/* Categories dropdown */}
                <div className="relative group">
                    <button className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-100 hover:bg-blue-200 transition">
                        <Bars3Icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-700">Danh mục sản phẩm</span>
                    </button>
                    <div
                        className="absolute left-0 w-64 bg-white border rounded-lg shadow-lg z-50
                        opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                        transition-opacity duration-200"
                    >
                        <ul className="divide-y divide-gray-100">
                            {categories.length > 0 ? (
                                categories.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex justify-between items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                                        onClick={() => nav(`/products?category_id=${c.id}`)}
                                    >
                                        <span className="text-gray-700">{c.name}</span>
                                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500">Không có danh mục</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Menu items desktop */}
                {!user || user.role === "customer" ? (
                    <>
                        <button onClick={() => nav("/products")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Sản phẩm</button>
                        <button onClick={() => nav("/vouchers")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Khuyến mãi</button>
                        <button onClick={() => nav("/purchase")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Lịch sử mua hàng</button>
                        <button onClick={() => nav("/loyalty-point")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Lịch sử tích điểm</button>
                    </>
                ) : role === "staff" ? (
                    <>
                        <button onClick={() => nav("/staff/home")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Trang nhân viên</button>
                        <button onClick={() => nav("/products")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Sản phẩm</button>
                        <button onClick={() => nav("/staff/receipts")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Phiếu nhập hàng</button>
                        <button onClick={() => nav("/staff/orders")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Đơn hàng</button>
                        <button onClick={() => nav("/staff/orders/pending")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Đơn đang chờ</button>
                        <button onClick={() => nav("/staff/revenue")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Báo cáo doanh thu</button>
                    </>
                ) : role === "manager" ? (
                    <>
                        <button onClick={() => nav("/manager/home")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Trang quản lý</button>
                        <button onClick={() => nav("/products")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Sản phẩm</button>
                        <button onClick={() => nav("/manager/receipts")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Phiếu nhập hàng</button>
                        <button onClick={() => nav("/manager/users")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Quản lý người dùng</button>
                        <button onClick={() => nav("/manager/orders")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Đơn hàng</button>
                        <button onClick={() => nav("/manager/orders/pending")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Đơn đang chờ</button>
                        <button onClick={() => nav("/manager/products/pending")} className="px-3 py-2 rounded-md hover:bg-blue-100 transition">Duyệt sản phẩm</button>
                    </>
                ) : null}
            </nav>

            {/* Mobile Drawer Menu */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 z-50 transform ${showMenu ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 md:hidden`}
                onClick={() => setShowMenu(false)}
            >
                <div
                    className="w-64 bg-white h-full p-4 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="mb-4 text-gray-600 hover:text-blue-600"
                        onClick={() => setShowMenu(false)}
                    >
                        Đóng ✕
                    </button>
                    <ul className="space-y-3">
                        <li className="font-semibold text-blue-600">Danh mục sản phẩm</li>
                        {categories.length > 0 ? (
                            categories.map((c) => (
                                <li
                                    key={c.id}
                                    className="text-gray-700 hover:text-blue-600 cursor-pointer"
                                    onClick={() => {
                                        nav(`/products?category_id=${c.id}`);
                                        setShowMenu(false);
                                    }}
                                >
                                    {c.name}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500">Không có danh mục</li>
                        )}

                        <hr />
                        {/* Menu theo role */}
                        {!user || user.role === "customer" ? (
                            <>
                                <li onClick={() => { nav("/products"); setShowMenu(false); }}>Sản phẩm</li>
                                <li onClick={() => { nav("/vouchers"); setShowMenu(false); }}>Khuyến mãi</li>
                                <li onClick={() => { nav("/purchase"); setShowMenu(false); }}>Lịch sử mua hàng</li>
                                <li onClick={() => { nav("/loyalty-point"); setShowMenu(false); }}>Lịch sử tích điểm</li>
                            </>
                        ) : role === "staff" ? (
                            <>
                                <li onClick={() => { nav("/staff/home"); setShowMenu(false); }}>Trang nhân viên</li>
                                <li onClick={() => { nav("/products"); setShowMenu(false); }}>Sản phẩm</li>
                                <li onClick={() => { nav("/staff/receipts"); setShowMenu(false); }}>Phiếu nhập hàng</li>
                                <li onClick={() => { nav("/staff/orders"); setShowMenu(false); }}>Đơn hàng</li>
                                <li onClick={() => { nav("/staff/orders/pending"); setShowMenu(false); }}>Đơn đang chờ</li>
                                <li onClick={() => { nav("/staff/revenue"); setShowMenu(false); }}>Báo cáo doanh thu</li>
                            </>
                        ) : role === "manager" ? (
                            <>
                                <li onClick={() => { nav("/manager/home"); setShowMenu(false); }}>Trang quản lý</li>
                                <li onClick={() => { nav("/products"); setShowMenu(false); }}>Sản phẩm</li>
                                <li onClick={() => { nav("/manager/receipts"); setShowMenu(false); }}>Phiếu nhập hàng</li>
                                <li onClick={() => { nav("/manager/users"); setShowMenu(false); }}>Quản lý người dùng</li>
                                <li onClick={() => { nav("/manager/orders"); setShowMenu(false); }}>Đơn hàng</li>
                                <li onClick={() => { nav("/manager/orders/pending"); setShowMenu(false); }}>Đơn đang chờ</li>
                                <li onClick={() => { nav("/manager/products/pending"); setShowMenu(false); }}>Duyệt sản phẩm</li>
                            </>
                        ) : null}
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;