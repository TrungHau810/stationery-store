import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";

const AddProduct = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [thumbnails, setThumbnails] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [mainPreview, setMainPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const suppliersRes = await authApis().get(endpoint["suppliers"]);
            const categoriesRes = await authApis().get(endpoint["category"]);
            setSuppliers(suppliersRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Error fetching suppliers/categories", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleThumbnailChange = (e) => {
        const files = Array.from(e.target.files);
        setThumbnails((prev) => [...prev, ...files]);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    };

    const handleRemoveThumbnail = (index) => {
        setThumbnails((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMainImageChange = (e) => {
        if (e.target.files[0]) {
            setMainPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const form = e.target;
            const formData = new FormData();

            if (!form.name.value || form.price.value <= 0 || form.quantity.value <= 0) {
                Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin hợp lệ", "error");
                setLoading(false);
                return;
            }

            formData.append("name", form.name.value);
            formData.append("price", form.price.value);
            formData.append("quantity", form.quantity.value);
            formData.append("description", form.description.value);
            formData.append("category", form.category.value);
            formData.append("brand", form.brand.value);

            if (form.image.files[0]) formData.append("image", form.image.files[0]);
            thumbnails.forEach((file) => formData.append("images", file));

            const res = await authApis().post(endpoint["product"], formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 201) {
                Swal.fire("Thành công", "Đã thêm sản phẩm mới", "success");
                form.reset();
                setThumbnails([]);
                setPreviewUrls([]);
                setMainPreview(null);
            } else {
                throw new Error("Không thể thêm sản phẩm");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Lỗi", "Không thể thêm sản phẩm", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-8 pb-8 bg-white shadow-lg rounded-lg mt-2">
            <h3 className="text-3xl font-bold text-center text-gray-800">
                Thêm sản phẩm mới
            </h3>
            <p className="text-gray-600 text-center">Vui lòng điền đầy đủ thông tin sản phẩm</p>
            <p className="text-gray-600 text-center">Sản phẩm mới cần được duyệt bởi quản lý trước khi đăng bán</p>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2" onSubmit={submitForm}>
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Tên sản phẩm */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Tên sản phẩm</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nhập tên sản phẩm"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    {/* Giá */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Giá</label>
                        <input
                            type="number"
                            name="price"
                            placeholder="Nhập giá sản phẩm"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                            min="1"
                        />
                    </div>

                    {/* Số lượng */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Số lượng</label>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Nhập số lượng"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                            min="1"
                        />
                    </div>

                    {/* Danh mục */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Danh mục</label>
                        <select
                            name="category"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Thương hiệu */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Thương hiệu</label>
                        <select
                            name="brand"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                            required
                        >
                            <option value="">Chọn thương hiệu</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Ảnh chính */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Ảnh chính</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="image"
                            className="w-full text-gray-700"
                            onChange={handleMainImageChange}
                        />
                        {mainPreview && (
                            <div className="mt-3">
                                <img
                                    src={mainPreview}
                                    alt="Main preview"
                                    className="w-32 h-32 object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Ảnh phụ (nhiều ảnh)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleThumbnailChange}
                            className="w-full text-gray-700 mb-2"
                        />
                        <div className="flex flex-wrap gap-3">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative w-24 h-24 rounded overflow-hidden border">
                                    <img src={url} alt={`thumbnail-${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveThumbnail(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs hover:bg-red-600"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Mô tả</label>
                        <textarea
                            name="description"
                            placeholder="Nhập mô tả sản phẩm"
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200 flex justify-center items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <span className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin mr-2"></span>
                                Đang thêm...
                            </span>
                        ) : (
                            "Thêm sản phẩm"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;