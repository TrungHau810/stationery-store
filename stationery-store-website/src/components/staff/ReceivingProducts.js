import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";
import Select, { components } from "react-select";

const ReceivingProducts = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1); // trang hiện tại
    const [hasMore, setHasMore] = useState(true); // còn trang nữa không
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Load NCC
    const loadSuppliers = async () => {
        try {
            const res = await authApis().get(endpoint["suppliers"]);
            setSuppliers(res.data);
        } catch (err) {
            console.error("Lỗi load suppliers:", err);
        }
    };

    // Load SP theo NCC và phân trang
    const fetchProducts = async (supplierId, pageNum = 1, append = false) => {
        try {
            const res = await authApis().get(
                `${endpoint["product"]}?brand_id=${supplierId}&page=${pageNum}`
            );
            const results = res.data.results || res.data;
            setProducts((prev) => (append ? [...prev, ...results] : results));
            setHasMore(res.data.next !== null); // tuỳ API trả về next page
            setPage(pageNum);
        } catch (err) {
            console.error("Lỗi load products:", err);
            setProducts([]);
            setHasMore(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            fetchProducts(selectedSupplier, 1, false);
        } else {
            setProducts([]);
        }
        setSelectedProduct(null);
        setSelectedProducts([]);
    }, [selectedSupplier]);

    // Thêm sản phẩm vào bảng
    const addProduct = () => {
        if (!selectedProduct) return;
        const product = products.find((p) => p.id === selectedProduct.value);
        if (!product) return;

        if (!selectedProducts.some((p) => p.id === product.id)) {
            setSelectedProducts((prev) => [
                ...prev,
                { ...product, quantity: 1, price: product.price || 0 },
            ]);
        } else {
            Swal.fire("Thông báo", "Sản phẩm đã có trong danh sách.", "info");
        }
        setSelectedProduct(null);
    };

    // Xóa sản phẩm
    const removeProduct = (id) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    };

    // Cập nhật số lượng
    const updateQuantity = (id, quantity) => {
        setSelectedProducts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, quantity: Math.max(1, Number(quantity)) } : p
            )
        );
    };

    // Tổng tiền
    const total = selectedProducts.reduce(
        (sum, p) => sum + p.quantity * p.price,
        0
    );

    // Lưu phiếu nhập
    const saveReceivingNote = async () => {
        if (!selectedSupplier) {
            Swal.fire("Thông báo", "Vui lòng chọn nhà cung cấp.", "warning");
            return;
        }
        if (selectedProducts.length === 0) {
            Swal.fire("Thông báo", "Chưa có sản phẩm nào.", "warning");
            return;
        }

        const data = {
            supplier_id: selectedSupplier,
            goods_receipt_details: selectedProducts.map((p) => ({
                product_id: p.id,
                quantity: p.quantity,
            })),
        };

        try {
            await authApis().post(endpoint["goods_receipt"], data);
            Swal.fire("Thành công", "Đã lưu phiếu nhập hàng.", "success");
            setSelectedSupplier("");
            setProducts([]);
            setSelectedProducts([]);
        } catch (err) {
            console.error("Lỗi lưu phiếu nhập:", err);
            Swal.fire("Lỗi", "Không thể lưu phiếu nhập.", "error");
        }
    };

    // Custom option cho react-select
    const Option = (props) => {
        const { data } = props;
        if (data.isLoadMore) {
            return (
                <div
                    className="px-4 py-2 text-center text-blue-600 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        data.onClick();
                    }}
                >
                    Xem thêm...
                </div>
            );
        }
        return <components.Option {...props} />;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-2xl font-bold text-center mb-8">Tạo phiếu nhập hàng</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bảng SP bên trái */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm nhập</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border">Mã SP</th>
                                    <th className="px-4 py-2 border">Tên sản phẩm</th>
                                    <th className="px-4 py-2 border">Số lượng</th>
                                    <th className="px-4 py-2 border">Đơn giá</th>
                                    <th className="px-4 py-2 border">Thành tiền</th>
                                    <th className="px-4 py-2 border">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((p) => (
                                    <tr key={p.id} className="text-center">
                                        <td className="px-4 py-2 border">{p.id}</td>
                                        <td className="px-4 py-2 border">{p.name}</td>
                                        <td className="px-4 py-2 border">
                                            <input
                                                type="number"
                                                min="1"
                                                value={p.quantity}
                                                onChange={(e) => updateQuantity(p.id, e.target.value)}
                                                className="w-20 p-1 border rounded text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border text-right">
                                            {p.price.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-4 py-2 border text-right">
                                            {Number(p.quantity * p.price).toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <button
                                                onClick={() => removeProduct(p.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {selectedProducts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-gray-500 py-4 border"
                                        >
                                            Chưa có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Tổng tiền */}
                    <div className="text-right font-bold text-lg mt-4">
                        Tổng cộng: {total.toLocaleString("vi-VN")} đ
                    </div>
                </div>

                {/* Chọn NCC và SP bên phải */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin nhập hàng</h2>

                    {/* NCC */}
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-1">
                            Nhà cung cấp
                        </label>
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SP */}
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-1">
                            Chọn sản phẩm
                        </label>
                        <Select
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            options={[
                                ...products.map((p) => ({ value: p.id, label: p.name })),
                                hasMore
                                    ? {
                                        value: "load_more",
                                        label: "Xem thêm...",
                                        isLoadMore: true,
                                        onClick: () => fetchProducts(selectedSupplier, page + 1, true),
                                    }
                                    : null,
                            ].filter(Boolean)}
                            placeholder="Tìm kiếm sản phẩm..."
                            isClearable
                            isSearchable
                            isDisabled={!products.length}
                            components={{ Option }}
                        />
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={addProduct}
                            disabled={!selectedProduct || selectedProduct.value === "load_more"}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Thêm sản phẩm
                        </button>
                        <button
                            onClick={saveReceivingNote}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Lưu phiếu nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceivingProducts;