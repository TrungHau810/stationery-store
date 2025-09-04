import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";
import Select from "react-select/base";

const ReceivingProducts = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);

    const fetchProducts = async (supplierId) => {
        let url = `${endpoint["product"]}?brand_id=${supplierId}`;
        try {
            const res = await authApis().get(url);
            setProducts(res.data);
        } catch (error) {
            console.error("Lỗi load products:", error);
            setProducts([]);
        }
    };

    const loadSuppliers = async () => {
        try {
            const res = await authApis().get(endpoint["suppliers"]);
            setSuppliers(res.data);
        } catch (err) {
            console.error("Lỗi load suppliers:", err);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (selectedSupplier) {
            fetchProducts(selectedSupplier);
        } else {
            setProducts([]);
        }
        setSelectedProducts([]);
    }, [selectedSupplier]);

    const addProduct = (productId) => {
        const product = products.find((p) => p.id === Number(productId));
        if (product && !selectedProducts.some((p) => p.id === product.id)) {
            setSelectedProducts((prev) => [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    quantity: 1,
                },
            ]);
        }
    };

    const removeProduct = (productId) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setSelectedProducts((prev) =>
            prev.map((p) =>
                p.id === productId ? { ...p, quantity: Number(quantity) } : p
            )
        );
    };

    const saveReceivingNote = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire("Thông báo", "Chưa có sản phẩm nào được thêm.", "warning");
            return;
        }

        const data = {
            supplier: selectedSupplier,
            goods_receipt_details: selectedProducts.map((product) => ({
                product_id: product.id,
                quantity: product.quantity,
            })),
        };

        try {
            await authApis().post(endpoint["goods_receipt"], data);
            Swal.fire({
                icon: "success",
                title: "Lưu phiếu nhập hàng thành công",
                showConfirmButton: false,
                timer: 1500,
            });
            setSelectedSupplier("");
            setSelectedProducts([]);
        } catch (error) {
            console.error("Lỗi lưu phiếu nhập hàng:", error);
            Swal.fire("Lỗi", "Lỗi lưu phiếu nhập hàng.", "error");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans">
            <h1 className="text-2xl font-bold text-center mb-6">Tạo phiếu nhập hàng</h1>
            <h2 className="text-gray-600 mb-4 text-center">Lưu ý: Bạn chỉ có thể nhập kho với một nhà cung cấp duy nhất.</h2>

            {/* Chọn NCC & SP */}
            <div className="flex gap-4 mb-6">
                <Select
                    options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                    value={suppliers.find(s => s.id === Number(selectedSupplier))
                        ? { value: selectedSupplier, label: suppliers.find(s => s.id === Number(selectedSupplier)).name }
                        : null}
                    onChange={(option) => setSelectedSupplier(option?.value || "")}
                    placeholder="Chọn nhà cung cấp"
                    className="w-full"
                />

                <select
                    disabled={!selectedSupplier}
                    onChange={(e) => {
                        addProduct(e.target.value);
                        e.target.value = "";
                    }}
                    defaultValue=""
                    className="flex-2 p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            Mã SP: {product.id} - {product.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Bảng sản phẩm */}
            {selectedProducts.length > 0 ? (
                <div className="overflow-x-auto mb-6">
                    <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">Mã sản phẩm</th>
                                <th className="px-4 py-2 border">Ảnh sản phẩm</th>
                                <th className="px-4 py-2 border">Sản phẩm</th>
                                <th className="px-4 py-2 border">Số lượng</th>
                                <th className="px-4 py-2 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProducts.map((product) => (
                                <tr key={product.id} className="text-center">
                                    <td className="px-4 py-2 border">{product.id}</td>
                                    <td className="px-4 py-2 border">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover mx-auto"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border">{product.name}</td>
                                    <td className="px-4 py-2 border">
                                        <input
                                            type="number"
                                            min="1"
                                            value={product.quantity}
                                            onChange={(e) =>
                                                updateQuantity(product.id, e.target.value)
                                            }
                                            className="w-20 p-1 border rounded-md text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <button
                                            onClick={() => removeProduct(product.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 mb-6">
                    Chưa có sản phẩm nào được thêm.
                </p>
            )}

            {/* Nút lưu */}
            <div className="text-center">
                <button
                    onClick={saveReceivingNote}
                    className="px-6 py-2 bg-green-600 text-white rounded-md text-lg hover:bg-green-700"
                >
                    Lưu phiếu nhập
                </button>
            </div>
        </div>
    );
};

export default ReceivingProducts;