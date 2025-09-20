import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import Swal from "sweetalert2";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineEye,
} from "react-icons/ai";

const ProductPending = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await authApis().get(endpoint["products_pending"]);
      setProducts(response.data.results);
    } catch (error) {
      console.error("Error fetching pending products:", error);
    } finally {
      setLoading(false);
    }
  };

  const approval = async (productId) => {
    try {
      setLoading(true);
      await authApis().patch(endpoint["product_detail"](productId), {
        active: true,
      });
      Swal.fire({
        icon: "success",
        title: "Duyệt sản phẩm thành công",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchPendingProducts();
      setSelected(null);
    } catch (error) {
      console.error("Error approving product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-3 text-gray-800 text-center">
        Danh sách sản phẩm đang chờ duyệt
      </h1>
      <p className="text-lg text-gray-600 mb-4 text-center">
        Kiểm tra kỹ thông tin trước khi duyệt sản phẩm
      </p>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-white font-medium">Đang xử lý...</p>
          </div>
        </div>
      )}

      {/* Bảng sản phẩm */}
      {Array.isArray(products) && products.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-center">Ảnh</th>
                <th className="px-6 py-3">Tên sản phẩm</th>
                <th className="px-6 py-3">Giá</th>
                <th className="px-6 py-3">Số lượng</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-6 py-3 text-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-14 w-14 object-contain rounded-lg border shadow-sm mx-auto"
                    />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {p.name}
                  </td>
                  <td className="px-6 py-3 text-red-500 font-semibold">
                    {Number(p.price).toLocaleString()}đ
                  </td>
                  <td className="px-6 py-3">{p.quantity}</td>
                  <td className="px-6 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      <AiOutlineEye /> Xem
                    </button>
                    <button
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition"
                      onClick={() => approval(p.id)}
                    >
                      <AiOutlineCheckCircle /> Duyệt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="mt-6 text-gray-500 text-center">
            Không có sản phẩm nào đang chờ duyệt
          </div>
        )
      )}

      {/* Modal chi tiết */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col relative animate-fade-up">
            {/* Nút đóng */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
            >
              <AiOutlineClose />
            </button>

            {/* Nội dung modal */}
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="h-56 w-full object-contain rounded-lg border shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-bold mb-3">{selected.name}</h2>
                  <p className="text-gray-600 mb-2">Thương hiệu: {selected.brand.name}</p>
                  <p className="text-gray-600 mb-2">
                    Giá:{" "}
                    <span className="text-red-500 font-semibold">
                      {Number(selected.price).toLocaleString()}đ
                    </span>
                  </p>
                  <p className="text-gray-600 mb-2">
                    Số lượng: {selected.quantity}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="text-gray-700 text-sm prose max-w-none">
                <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: selected.description }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t p-4 bg-gray-50 rounded-b-2xl">
              <button
                className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                onClick={() => approval(selected.id)}
              >
                <AiOutlineCheckCircle /> Duyệt
              </button>
              <button
                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                onClick={() => setSelected(null)}
              >
                <AiOutlineClose /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPending;