import { useNavigate, useSearchParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useContext, useEffect, useState } from "react";
import ProductCard from "./layout/ProductCard";
import { MyUserContext } from "../configs/Contexts";
import { LoadingSpinner } from "./layout/LoadingSpinner";

const ProductList = () => {
    const [user,]= useContext(MyUserContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy role user từ localStorage (hoặc từ context nếu bạn có)

    const keyword = searchParams.get("keyword") || "";
    const priceMin = searchParams.get("price_min") || "";
    const priceMax = searchParams.get("price_max") || "";
    const categoryId = searchParams.get("category_id") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const fetchCategories = async () => {
        try {
            const res = await Apis.get(endpoint["category"]);
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `${endpoint["product"]}`;
            let params = [];
            if (keyword) params.push(`kw=${keyword}`);
            if (priceMin) params.push(`price_min=${priceMin}`);
            if (priceMax) params.push(`price_max=${priceMax}`);
            if (categoryId) params.push(`category=${categoryId}`);
            params.push(`page=${page}`);
            if (params.length > 0) url += `?${params.join("&")}`;

            const res = await Apis.get(url);
            setProducts(res.data.results);
            setCount(res.data.count);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [keyword, priceMin, priceMax, categoryId, page]);

    const handleFilter = (e) => {
        e.preventDefault();
        const min = e.target.min.value;
        const max = e.target.max.value;
        const cat = e.target.category.value;

        let newParams = {};
        if (keyword) newParams.keyword = keyword;
        if (min) newParams.price_min = min;
        if (max) newParams.price_max = max;
        if (cat) newParams.category_id = cat;
        newParams.page = 1;

        setSearchParams(newParams);
    };

    const totalPages = Math.ceil(count / 10);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    {keyword ? `Kết quả cho "${keyword}"` : "Tất cả sản phẩm"}
                </h2>
                {/* Hiển thị nút Thêm sản phẩm nếu role là staff hoặc manager */}
                {(user?.role === "staff" || user?.role === "manager") && (
                    <button
                        onClick={() => navigate("/products/add")}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Thêm sản phẩm
                    </button>
                )}
            </div>

            {/* Form lọc */}
            <form onSubmit={handleFilter} className="flex gap-4 mb-6 flex-wrap">
                <select name="category" defaultValue={categoryId} className="px-3 py-2 border rounded">
                    <option value="">Tất cả danh mục</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="min"
                    placeholder="Giá thấp nhất"
                    defaultValue={priceMin}
                    className="px-3 py-2 border rounded"
                />
                <input
                    type="number"
                    name="max"
                    placeholder="Giá cao nhất"
                    defaultValue={priceMax}
                    className="px-3 py-2 border rounded"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Lọc
                </button>
            </form>

            {/* Loading */}
            {loading ? (
                <LoadingSpinner content="Đang tải sản phẩm..." />
            ) : products.length === 0 ? (
                <p className="text-gray-500 text-center">Không tìm thấy sản phẩm nào.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {products.map(product => (
                        <ProductCard item={product} key={product.id} />
                    ))}
                </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 flex-wrap">
                    <button
                        disabled={page <= 1}
                        onClick={() => setSearchParams({ keyword, price_min: priceMin, price_max: priceMax, category_id: categoryId, page: page - 1 })}
                        className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                        Trang trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setSearchParams({ keyword, price_min: priceMin, price_max: priceMax, category_id: categoryId, page: p })}
                            className={`px-3 py-2 border rounded ${p === page ? "bg-blue-500 text-white" : ""}`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setSearchParams({ keyword, price_min: priceMin, price_max: priceMax, category_id: categoryId, page: page + 1 })}
                        className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductList;