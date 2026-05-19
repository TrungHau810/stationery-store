import { useNavigate, useSearchParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { useContext, useEffect, useState } from "react";

import {
    FunnelIcon,
    PlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";

import ProductCard from "./layout/ProductCard";
import { MyUserContext } from "../configs/Contexts";
import { LoadingSpinner } from "./layout/LoadingSpinner";

const ProductList = () => {
    const [user] = useContext(MyUserContext);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();

    const keyword = searchParams.get("keyword") || "";
    const priceMin = searchParams.get("price_min") || "";
    const priceMax = searchParams.get("price_max") || "";
    const categoryId = searchParams.get("category_id") || "";
    const page = parseInt(searchParams.get("page") || "1");

    useEffect(() => {
        fetchCategories();
        fetchProducts();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, priceMin, priceMax, categoryId, page]);

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

            if (keyword)
                params.push(`kw=${keyword}`);

            if (priceMin)
                params.push(`price_min=${priceMin}`);

            if (priceMax)
                params.push(`price_max=${priceMax}`);

            if (categoryId)
                params.push(`category=${categoryId}`);

            params.push(`page=${page}`);

            if (params.length > 0)
                url += `?${params.join("&")}`;

            const res = await Apis.get(url);

            setProducts(res.data.results);
            setCount(res.data.count);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();

        const min = e.target.min.value;
        const max = e.target.max.value;
        const cat = e.target.category.value;

        let newParams = {};

        if (keyword)
            newParams.keyword = keyword;

        if (min)
            newParams.price_min = min;

        if (max)
            newParams.price_max = max;

        if (cat)
            newParams.category_id = cat;

        newParams.page = 1;

        setSearchParams(newParams);
    };

    const totalPages = Math.ceil(count / 10);

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

                    <div>

                        <h1 className="text-3xl font-black tracking-tight text-slate-800">
                            {keyword
                                ? `Kết quả cho "${keyword}"`
                                : "Tất cả sản phẩm"}
                        </h1>

                        <p className="text-slate-500 mt-2 text-sm">
                            {count} sản phẩm
                        </p>
                    </div>

                    {(user?.role === "staff" || user?.role === "manager") && (
                        <button
                            onClick={() => navigate("/products/add")}
                            className="
                                h-11 px-5
                                rounded-2xl
                                bg-gradient-to-r from-emerald-500 to-emerald-600
                                text-white
                                text-sm font-semibold
                                shadow-lg shadow-emerald-200
                                hover:scale-[1.02]
                                hover:shadow-xl
                                transition-all
                                flex items-center justify-center gap-2
                            "
                        >
                            <PlusIcon className="h-5 w-5" />
                            Thêm sản phẩm
                        </button>
                    )}
                </div>

                {/* FILTER */}
                <div
                    className="
                        bg-white
                        border border-slate-200
                        rounded-3xl
                        p-5
                        shadow-sm
                        mb-8
                    "
                >

                    <div className="flex items-center gap-2 mb-5">

                        <div
                            className="
                                w-10 h-10
                                rounded-2xl
                                bg-blue-100
                                flex items-center justify-center
                            "
                        >
                            <FunnelIcon className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800">
                                Bộ lọc sản phẩm
                            </h3>

                            <p className="text-sm text-slate-500">
                                Lọc theo danh mục và khoảng giá
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleFilter}
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-4
                            gap-4
                        "
                    >

                        {/* CATEGORY */}
                        <select
                            name="category"
                            defaultValue={categoryId}
                            className="
                                h-12 px-4
                                rounded-2xl
                                border border-slate-200
                                bg-slate-50
                                text-sm
                                focus:outline-none
                                focus:ring-4 focus:ring-blue-100
                                focus:border-blue-400
                            "
                        >
                            <option value="">
                                Tất cả danh mục
                            </option>

                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* MIN PRICE */}
                        <input
                            type="number"
                            name="min"
                            placeholder="Giá thấp nhất"
                            defaultValue={priceMin}
                            className="
                                h-12 px-4
                                rounded-2xl
                                border border-slate-200
                                bg-slate-50
                                text-sm
                                focus:outline-none
                                focus:ring-4 focus:ring-blue-100
                                focus:border-blue-400
                            "
                        />

                        {/* MAX PRICE */}
                        <input
                            type="number"
                            name="max"
                            placeholder="Giá cao nhất"
                            defaultValue={priceMax}
                            className="
                                h-12 px-4
                                rounded-2xl
                                border border-slate-200
                                bg-slate-50
                                text-sm
                                focus:outline-none
                                focus:ring-4 focus:ring-blue-100
                                focus:border-blue-400
                            "
                        />

                        {/* BUTTON */}
                        <button
                            type="submit"
                            className="
                                h-12
                                rounded-2xl
                                bg-blue-600
                                text-white
                                text-sm font-semibold
                                hover:bg-blue-700
                                transition-all
                                shadow-lg shadow-blue-100
                            "
                        >
                            Áp dụng bộ lọc
                        </button>
                    </form>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner content="Đang tải sản phẩm..." />
                    </div>
                ) : products.length === 0 ? (

                    <div
                        className="
                            bg-white
                            rounded-3xl
                            border border-slate-200
                            py-24
                            text-center
                            shadow-sm
                        "
                    >
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            Không tìm thấy sản phẩm
                        </h3>

                        <p className="text-slate-500 text-sm">
                            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>

                ) : (
                    <>
                        {/* PRODUCT GRID */}
                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                md:grid-cols-3
                                xl:grid-cols-4
                                2xl:grid-cols-5
                                gap-6
                            "
                        >
                            {products.map((product) => (
                                <ProductCard
                                    item={product}
                                    key={product.id}
                                />
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12">

                                <div
                                    className="
                                        flex items-center gap-2
                                        bg-white
                                        border border-slate-200
                                        rounded-2xl
                                        p-2
                                        shadow-sm
                                        flex-wrap
                                        justify-center
                                    "
                                >

                                    {/* PREVIOUS */}
                                    <button
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setSearchParams({
                                                keyword,
                                                price_min: priceMin,
                                                price_max: priceMax,
                                                category_id: categoryId,
                                                page: page - 1,
                                            })
                                        }
                                        className="
                                            h-11 w-11
                                            rounded-xl
                                            flex items-center justify-center
                                            text-slate-600
                                            hover:bg-slate-100
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                            transition
                                        "
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>

                                    {/* PAGE NUMBERS */}
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() =>
                                                setSearchParams({
                                                    keyword,
                                                    price_min: priceMin,
                                                    price_max: priceMax,
                                                    category_id: categoryId,
                                                    page: p,
                                                })
                                            }
                                            className={`
                                                h-11 min-w-[44px]
                                                px-3
                                                rounded-xl
                                                text-sm font-semibold
                                                transition-all
                                                ${p === page
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : "text-slate-600 hover:bg-slate-100"}
                                            `}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    {/* NEXT */}
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() =>
                                            setSearchParams({
                                                keyword,
                                                price_min: priceMin,
                                                price_max: priceMax,
                                                category_id: categoryId,
                                                page: page + 1,
                                            })
                                        }
                                        className="
                                            h-11 w-11
                                            rounded-xl
                                            flex items-center justify-center
                                            text-slate-600
                                            hover:bg-slate-100
                                            disabled:opacity-40
                                            disabled:cursor-not-allowed
                                            transition
                                        "
                                    >
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductList;