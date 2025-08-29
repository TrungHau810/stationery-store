import { useEffect, useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import ProductCard from "../components/layout/ProductCard";
import { useLocation } from "react-router-dom";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(null);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [loading, setLoading] = useState(false);

    const location = useLocation();

    const loadProducts = async () => {
        const params = new URLSearchParams(location.search);
        const kw = params.get("keyword") || "";

        let url = `${endpoint.product}?kw=${kw}&page=${page}`;
        console.log("URL:", url);

        try {
            setLoading(true);
            const res = await Apis.get(url);
            const { results, count, next, previous } = res.data;

            setProducts(results);
            setHasNext(Boolean(next));
            setHasPrev(Boolean(previous));

            // Chốt pageSize khi lần đầu
            if (pageSize == null) {
                setPageSize(results.length);
                setTotalPages(Math.max(1, Math.ceil(count / results.length)));
            } else {
                setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, location.search]); // thêm location.search để đổi từ khóa thì gọi lại API

    return (
        <div className="p-6">
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">Đang tải sản phẩm trong cửa hàng...</span>
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

            {/* Phân trang */}
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                    disabled={!hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                >
                    Trang trước
                </button>

                <span className="text-sm">
                    Trang {page} / {totalPages}
                </span>

                <button
                    disabled={!hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default Home;