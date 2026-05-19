import { useContext } from "react";
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/Cart";
import {
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

const ProductCard = ({ item }) => {
  const [user] = useContext(MyUserContext);
  const [, dispatchCart] = useContext(MyCartContext);
  const nav = useNavigate();

  const hasDiscount = Array.isArray(item.discount) && item.discount.length > 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">

      {/* IMAGE */}
      <div className="relative bg-slate-50 h-72 flex items-center justify-center overflow-hidden">

        <img
          src={item.image}
          alt={item.name}
          className="max-h-full max-w-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
        />

        {/* BADGE */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            Giảm giá
          </span>
        )}

        {/* QUICK ACTION */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100">

          <button
            onClick={() => nav(`/product/${item.id}`)}
            className="bg-white text-slate-700 px-4 py-2 rounded-xl shadow hover:bg-slate-100 flex items-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            Xem nhanh
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1">

        {/* NAME */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition">
          {item.name}
        </h3>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-2">

          <StarIcon className="h-4 w-4 text-yellow-400" />

          <span className="text-sm text-slate-600">
            {item.average_rating
              ? item.average_rating.toFixed(1)
              : "0.0"}
          </span>

          <span className="text-xs text-slate-400">
            ({item.count_reviews || 0})
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-3 flex items-center gap-2">

          <span className="text-lg font-bold text-red-600">
            {Number(item.price).toLocaleString("vi-VN")}₫
          </span>

          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {(Number(item.price) * 1.2).toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mt-auto pt-4 flex gap-2">

          <button
            onClick={() => nav(`/product/${item.id}`)}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
          >
            Chi tiết
          </button>

          {item.quantity > 0 ? (
            <button
              onClick={() =>
                addToCart({
                  user,
                  product: item,
                  dispatchCart,
                })
              }
              disabled={
                user?.role === "manager" ||
                user?.role === "staff"
              }
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Thêm
            </button>
          ) : (
            <button
              disabled
              className="flex-1 h-10 rounded-xl bg-slate-300 text-slate-600 text-sm cursor-not-allowed"
            >
              Hết hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;