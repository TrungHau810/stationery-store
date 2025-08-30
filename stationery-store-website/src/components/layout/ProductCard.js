import { useContext } from "react";
import { authApis, endpoint } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { addToCart } from "../../utils/Cart";

const ProductCard = ({ item }) => {

  const [user,] = useContext(MyUserContext);
  const nav = useNavigate();

  return (
    <div className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition bg-white flex flex-col">
      {/* Hình ảnh */}
      <div className="relative w-full h-72 flex items-center justify-center bg-gray-50">
        <img
          src={item.image}
          alt={item.name}
          className="max-h-full max-w-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
        />
        {Array.isArray(item.discount) && item.discount.length > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sale
          </span>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
          {item.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }, (_, i) => {
            const full = i + 1 <= Math.floor(item.avarge_rating); // sao đầy
            const half = !full && i < item.avarge_rating;          // sao nửa
            return (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill={full ? "gold" : half ? "url(#half)" : "lightgray"}
                stroke="currentColor"
              >
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="gold" />
                    <stop offset="50%" stopColor="lightgray" />
                  </linearGradient>
                </defs>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
             9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
            );
          })}
          <span className="text-sm text-gray-600">
            {item.avarge_rating ? item.avarge_rating.toFixed(1) : "0.0"} ({item.count_reviews || 0})
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-red-600 font-bold text-lg">
            {Number(item.price).toLocaleString("vi-VN")}₫
          </p>
          {Array.isArray(item.discount) && item.discount.length > 0 && (
            <p className="text-gray-400 text-sm line-through">
              {(Number(item.price) * 1.2).toLocaleString("vi-VN")}₫
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-blue-500 text-white text-sm py-2 rounded-md hover:bg-blue-600 transition" onClick={() => nav(`/product/${item.id}`)}>
            Xem chi tiết
          </button>
          {item.quantity > 0 ? (
            <button className="flex-1 bg-red-500 text-white text-sm py-2 rounded-md hover:bg-red-600 transition" onClick={() => addToCart({ user, product: item })}>
              Thêm vào giỏ
            </button>
          ) : (
            <button className="flex-1 bg-gray-500 text-white text-sm py-2 rounded-md cursor-not-allowed" disabled>
              Hết hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;