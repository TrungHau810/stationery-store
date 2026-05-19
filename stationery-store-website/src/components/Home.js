import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    PackageSearch,
} from "lucide-react";

import Apis, { endpoint } from "../configs/Apis";
import ProductCard from "../components/layout/ProductCard";
import { LoadingSpinner } from "./layout/LoadingSpinner";
import ChatBot from "./Chatbot";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const keyword = searchParams.get("keyword") || "";
    const page = parseInt(searchParams.get("page") || "1");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                let url = `${endpoint.product}?page=${page}`;

                if (keyword)
                    url += `&kw=${keyword}`;

                const res = await Apis.get(url);

                setProducts(res.data.results);
                setCount(res.data.count);

            } catch (err) {
                console.error("Error loading products:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [page, keyword]);

    const totalPages = Math.ceil(count / 10);

    const handlePageChange = (newPage) => {
        setSearchParams({
            ...(keyword && { keyword }),
            page: newPage,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Danh sách sản phẩm
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Hiển thị {count} sản phẩm
                        </p>
                    </div>

                    {keyword && (
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-sm font-medium">
                            <PackageSearch size={18} />
                            <span>Từ khóa: {keyword}</span>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <LoadingSpinner content="Đang tải sản phẩm..." />
                    </div>
                ) : products.length > 0 ? (
                    <>
                        {/* Product Grid */}
                        <div
                            className="
                                grid 
                                grid-cols-1 
                                sm:grid-cols-2 
                                md:grid-cols-3 
                                lg:grid-cols-4 
                                xl:grid-cols-5 
                                gap-6
                            "
                        >
                            {products.map((item) => (
                                <div
                                    key={item.id}
                                    className="
                                        transition-all duration-300
                                        hover:-translate-y-1
                                        hover:shadow-xl
                                    "
                                >
                                    <ProductCard item={item} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">

                                {/* Prev */}
                                <button
                                    disabled={page <= 1}
                                    onClick={() => handlePageChange(page - 1)}
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2 rounded-xl
                                        border border-slate-200
                                        bg-white
                                        text-slate-700
                                        shadow-sm
                                        hover:bg-slate-100
                                        transition-all
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    <ChevronLeft size={18} />
                                    <span>Trước</span>
                                </button>

                                {/* Page numbers */}
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`
                                                w-11 h-11 rounded-xl
                                                text-sm font-semibold
                                                transition-all duration-200
                                                border
                                                ${p === page
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}
                                            `}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                {/* Next */}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => handlePageChange(page + 1)}
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2 rounded-xl
                                        border border-slate-200
                                        bg-white
                                        text-slate-700
                                        shadow-sm
                                        hover:bg-slate-100
                                        transition-all
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    <span>Sau</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                            <PackageSearch
                                size={40}
                                className="text-slate-400"
                            />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-700">
                            Không tìm thấy sản phẩm
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Hãy thử tìm kiếm bằng từ khóa khác
                        </p>
                    </div>
                )}
            </div>

            {/* Chatbot */}
            <div className="fixed bottom-5 right-5 z-50">
                <ChatBot mode="customer" />
            </div>
        </div>
    );
};

export default Home;