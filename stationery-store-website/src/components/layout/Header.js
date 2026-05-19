import { useState, useEffect, useContext } from "react";
import {
    Bars3Icon,
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
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

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await Apis.get(endpoint["category"]);
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi load categories:", err);
            }
        };

        loadCategories();
    }, []);

    const handleSearch = () => {
        if (keyword.trim()) {
            nav(`/products?keyword=${keyword}`);
            setKeyword("");
            setShowSearch(false);
        }
    };

    const customerMenus = [
        {
            label: "Sản phẩm",
            path: "/products",
        },
        {
            label: "Khuyến mãi",
            path: "/vouchers",
        },
        {
            label: "Lịch sử mua hàng",
            path: "/purchase",
        },
        {
            label: "Lịch sử tích điểm",
            path: "/loyalty-point",
        },
    ];

    const staffMenus = [
        {
            label: "Trang nhân viên",
            path: "/staff/home",
        },
        {
            label: "Sản phẩm",
            path: "/products",
        },
        {
            label: "Phiếu nhập hàng",
            path: "/staff/receipts",
        },
        {
            label: "Đơn hàng",
            path: "/staff/orders",
        },
        {
            label: "Đơn đang chờ",
            path: "/staff/orders/pending",
        },
        {
            label: "Báo cáo doanh thu",
            path: "/staff/revenue",
        },
    ];

    const managerMenus = [
        {
            label: "Trang quản lý",
            path: "/manager/home",
        },
        {
            label: "Sản phẩm",
            path: "/products",
        },
        {
            label: "Phiếu nhập hàng",
            path: "/manager/receipts",
        },
        {
            label: "Quản lý người dùng",
            path: "/manager/users",
        },
        {
            label: "Đơn hàng",
            path: "/manager/orders",
        },
        {
            label: "Đơn đang chờ",
            path: "/manager/orders/pending",
        },
        {
            label: "Duyệt sản phẩm",
            path: "/manager/products/pending",
        },
    ];

    const menus = !user || role === "customer"
        ? customerMenus
        : role === "staff"
            ? staffMenus
            : managerMenus;

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">

            {/* TOP BAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between gap-4 py-4">

                    {/* LOGO */}
                    <button
                        className="
                            flex items-center
                            text-2xl font-black
                            tracking-tight
                            bg-gradient-to-r from-blue-600 to-indigo-600
                            bg-clip-text text-transparent
                            hover:opacity-80
                            transition
                            whitespace-nowrap
                        "
                        onClick={() => {
                            role === "customer" || role === undefined
                                ? nav("/")
                                : role === "staff"
                                    ? nav("/staff/home")
                                    : nav("/manager/home");
                        }}
                    >
                        Open Stationery
                    </button>

                    {/* SEARCH DESKTOP */}
                    <div className="hidden md:flex flex-1 justify-center px-4">

                        <div className="relative w-full max-w-2xl">

                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                                placeholder="Tìm kiếm sản phẩm..."
                                className="
                                    w-full h-12
                                    rounded-2xl
                                    border border-slate-200
                                    bg-slate-50
                                    pl-5 pr-14
                                    text-sm
                                    shadow-sm
                                    transition-all duration-200
                                    focus:outline-none
                                    focus:ring-4 focus:ring-blue-100
                                    focus:border-blue-400
                                    focus:bg-white
                                "
                            />

                            <button
                                onClick={handleSearch}
                                className="
                                    absolute right-2 top-1/2 -translate-y-1/2
                                    w-9 h-9
                                    rounded-xl
                                    bg-blue-600 text-white
                                    flex items-center justify-center
                                    hover:bg-blue-700
                                    transition
                                "
                            >
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">

                        {/* MOBILE SEARCH */}
                        <button
                            className="
                                md:hidden
                                w-10 h-10
                                rounded-xl
                                flex items-center justify-center
                                hover:bg-slate-100
                                transition
                            "
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <MagnifyingGlassIcon className="h-6 w-6 text-slate-700" />
                        </button>

                        {/* USER */}
                        {user ? (
                            <>
                                <button
                                    className="
                                        flex items-center gap-3
                                        px-3 py-2
                                        rounded-2xl
                                        hover:bg-slate-100
                                        transition
                                    "
                                    onClick={() => nav("/profile")}
                                >
                                    <img
                                        src={
                                            user.avatar ||
                                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                        }
                                        alt={user.full_name}
                                        className="
                                            h-10 w-10
                                            rounded-full
                                            object-cover
                                            border-2 border-white
                                            shadow
                                        "
                                    />

                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {user.full_name || "Người dùng"}
                                        </span>

                                        <span className="text-xs text-slate-400 capitalize">
                                            {role}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        dispatch({ type: "logout" });
                                        dispatchCart({ type: "clear" });
                                        nav("/");
                                    }}
                                    className="
                                        hidden md:block
                                        px-4 py-2
                                        rounded-xl
                                        text-sm font-medium
                                        text-slate-600
                                        hover:bg-slate-100
                                        hover:text-blue-600
                                        transition
                                    "
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">

                                <button
                                    onClick={() => nav("/login")}
                                    className="
                                        px-4 py-2
                                        rounded-xl
                                        text-sm font-medium
                                        text-slate-600
                                        hover:bg-slate-100
                                        transition
                                    "
                                >
                                    Đăng nhập
                                </button>

                                <button
                                    onClick={() => nav("/register")}
                                    className="
                                        px-4 py-2
                                        rounded-xl
                                        bg-blue-600 text-white
                                        text-sm font-medium
                                        hover:bg-blue-700
                                        transition
                                    "
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )}

                        {/* CART */}
                        {(!user || role === "customer") && (
                            <button
                                className="
                                    relative
                                    w-11 h-11
                                    rounded-2xl
                                    bg-slate-100
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                    flex items-center justify-center
                                    transition
                                "
                                onClick={() => nav("/cart")}
                            >
                                <ShoppingCartIcon className="h-6 w-6" />

                                {cart > 0 && (
                                    <span
                                        className="
                                            absolute -top-1 -right-1
                                            min-w-[20px] h-5 px-1
                                            rounded-full
                                            bg-red-500 text-white
                                            text-[11px] font-bold
                                            flex items-center justify-center
                                            shadow
                                        "
                                    >
                                        {cart}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* MOBILE MENU */}
                        <button
                            className="
                                md:hidden
                                w-10 h-10
                                rounded-xl
                                flex items-center justify-center
                                hover:bg-slate-100
                                transition
                            "
                            onClick={() => setShowMenu(true)}
                        >
                            <Bars3Icon className="h-6 w-6 text-slate-700" />
                        </button>
                    </div>
                </div>

                {/* MOBILE SEARCH */}
                {showSearch && (
                    <div className="pb-4 md:hidden">

                        <div className="relative">

                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                                placeholder="Tìm kiếm sản phẩm..."
                                className="
                                    w-full h-11
                                    rounded-xl
                                    border border-slate-200
                                    bg-slate-50
                                    pl-4 pr-12
                                    text-sm
                                    focus:outline-none
                                    focus:ring-4 focus:ring-blue-100
                                "
                            />

                            <button
                                onClick={handleSearch}
                                className="
                                    absolute right-3 top-1/2 -translate-y-1/2
                                    text-slate-500 hover:text-blue-600
                                "
                            >
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:block bg-slate-50 border-t border-slate-100">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3 py-3">

                        {/* CATEGORY DROPDOWN */}
                        <div className="relative group py-2">

                            <button
                                className="
                                    flex items-center gap-2
                                    px-4 py-2.5
                                    rounded-xl
                                    bg-blue-600 text-white
                                    shadow-sm
                                    hover:bg-blue-700
                                    transition-all
                                "
                            >
                                <Bars3Icon className="h-5 w-5" />

                                <span className="text-sm font-semibold">
                                    Danh mục sản phẩm
                                </span>
                            </button>

                            {/* DROPDOWN */}
                            <div
                                className="
                                    absolute left-0 top-full mt-1
                                    w-72
                                    bg-white
                                    border border-slate-200
                                    rounded-2xl
                                    shadow-2xl
                                    overflow-hidden
                                    z-50

                                    opacity-0 invisible
                                    translate-y-2

                                    group-hover:opacity-100
                                    group-hover:visible
                                    group-hover:translate-y-0

                                    transition-all duration-200
                                "
                            >
                                <ul className="py-2">

                                    {categories.length > 0 ? (
                                        categories.map((c) => (
                                            <li
                                                key={c.id}
                                                onClick={() =>
                                                    nav(`/products?category_id=${c.id}`)
                                                }
                                                className="
                                                    flex items-center justify-between
                                                    px-5 py-3
                                                    cursor-pointer
                                                    hover:bg-blue-50
                                                    transition
                                                "
                                            >
                                                <span className="text-sm font-medium text-slate-700">
                                                    {c.name}
                                                </span>

                                                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-5 py-3 text-sm text-slate-500">
                                            Không có danh mục
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* MENU ITEMS */}
                        <div className="flex items-center gap-1">

                            {menus.map((m, index) => (
                                <button
                                    key={index}
                                    onClick={() => nav(m.path)}
                                    className="
                                        px-4 py-2.5
                                        rounded-xl
                                        text-sm font-medium
                                        text-slate-600
                                        hover:bg-white
                                        hover:text-blue-600
                                        hover:shadow-sm
                                        transition-all
                                    "
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <div
                className={`
                    fixed inset-0 z-50 md:hidden
                    transition-all duration-300
                    ${showMenu
                        ? "bg-black/40 backdrop-blur-sm"
                        : "pointer-events-none bg-transparent"}
                `}
                onClick={() => setShowMenu(false)}
            >

                <div
                    className={`
                        absolute left-0 top-0
                        h-full w-80
                        bg-white
                        shadow-2xl
                        transition-transform duration-300
                        ${showMenu
                            ? "translate-x-0"
                            : "-translate-x-full"}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* HEADER */}
                    <div className="flex items-center justify-between p-5 border-b">

                        <h2 className="text-lg font-bold text-slate-800">
                            Menu
                        </h2>

                        <button
                            onClick={() => setShowMenu(false)}
                            className="
                                w-10 h-10
                                rounded-xl
                                hover:bg-slate-100
                                flex items-center justify-center
                            "
                        >
                            <XMarkIcon className="h-6 w-6 text-slate-700" />
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">

                        {/* CATEGORY */}
                        <div className="mb-6">

                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">
                                Danh mục
                            </h3>

                            <ul className="space-y-1">

                                {categories.map((c) => (
                                    <li
                                        key={c.id}
                                        onClick={() => {
                                            nav(`/products?category_id=${c.id}`);
                                            setShowMenu(false);
                                        }}
                                        className="
                                            px-4 py-3
                                            rounded-xl
                                            text-slate-700
                                            hover:bg-slate-100
                                            transition
                                            cursor-pointer
                                        "
                                    >
                                        {c.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* MENU */}
                        <div>

                            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">
                                Điều hướng
                            </h3>

                            <ul className="space-y-1">

                                {menus.map((m, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            nav(m.path);
                                            setShowMenu(false);
                                        }}
                                        className="
                                            px-4 py-3
                                            rounded-xl
                                            text-slate-700
                                            hover:bg-slate-100
                                            transition
                                            cursor-pointer
                                        "
                                    >
                                        {m.label}
                                    </li>
                                ))}

                                {user && (
                                    <li
                                        onClick={() => {
                                            dispatch({ type: "logout" });
                                            dispatchCart({ type: "clear" });
                                            nav("/");
                                            setShowMenu(false);
                                        }}
                                        className="
                                            px-4 py-3
                                            rounded-xl
                                            text-red-500
                                            hover:bg-red-50
                                            transition
                                            cursor-pointer
                                        "
                                    >
                                        Đăng xuất
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;