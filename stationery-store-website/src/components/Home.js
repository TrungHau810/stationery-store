import { useEffect, useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import ProductCard from "../components/layout/ProductCard";
import { useSearchParams } from "react-router-dom";
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
                if (keyword) url += `&kw=${keyword}`;
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

    const totalPages = Math.ceil(count / 10); // backend trả mặc định 10/sp 1 trang

    return (
        <div className="p-6">
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-3">
                    <LoadingSpinner content="Đang tải sản phẩm..." />
                </div>
            ) : products.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((item) => (
                        <ProductCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-lg font-semibold">Không tìm thấy sản phẩm nào</h2>
                </div>
            )}

            {/* Phân trang giống ProductList */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 flex-wrap">
                    <button
                        disabled={page <= 1}
                        onClick={() => setSearchParams({ keyword, page: page - 1 })}
                        className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                        Trang trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setSearchParams({ keyword, page: p })}
                            className={`px-3 py-2 border rounded ${p === page ? "bg-blue-500 text-white" : ""
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setSearchParams({ keyword, page: page + 1 })}
                        className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                        Trang sau
                    </button>
                </div>
            )}

            {/* Chatbot */}
            <ChatBot mode="customer" />
        </div>
    );
};

export default Home;