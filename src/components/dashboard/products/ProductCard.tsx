import React from "react";
import type { Product, CartItem } from "../../../types/product";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const firstImage =
    product.imageUrl?.[0]?.image1 ||
    product.imageUrl?.[0]?.imageUrl ||
    "/placeholder.png";

  const avgRating =
    product.penilaian ??
    ((product.rating?.length ?? 0) > 0
      ? product.rating!.reduce((sum, r) => sum + (r.bintang || 0), 0) /
        product.rating!.length
      : 0);

  const reviewCount = product.rating?.length ?? 0;

  const handleClick = () => {
    if (user) {
      navigate(`/user/product/${product.category}/${product.id}`, {
        state: { product },
      });
    } else {
      navigate(`/product/${product.category}/${product.id}`, {
        state: { product },
      });
    }
  };

  // ✅ handler Add to Cart
  // ✅ handler Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Kamu harus login dulu untuk tambah ke keranjang!");
      navigate("/login");
      return;
    }

    if ((product.quantity ?? 0) < 1) {
      alert("Stok produk habis!");
      return;
    }

    // Product → CartItem (lengkap biar ga ada undefined)
    const cartItem: CartItem = {
      id: product.id,
      nama: product.nama ?? "Unknown Product",
      harga: product.hargaPromo ?? product.harga ?? 0,
      imageUrl: product.imageUrl ?? [],
      cartQuantity: 1,
      selected: true,
      category: product.category ?? "unknown",
      deskripsi: product.deskripsi ?? "",
      quantity: product.quantity ?? 1,
      satuan: product.satuan ?? "pcs",
      status: product.status ?? "active",
    };

    addToCart(cartItem);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="cursor-pointer group relative flex flex-col overflow-hidden rounded-xl border !bg-white hover:shadow-lg transition"
    >
      {/* Gambar */}
      <div className="aspect-square w-full overflow-hidden !bg-gray-50">
        <img
          src={firstImage}
          alt={product.nama || "Produk"}
          loading="lazy"
          className="h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Konten */}
      <div className="p-3 flex flex-col flex-1">
        {/* Nama Produk */}
        <h3 className="text-sm font-medium !text-gray-800 line-clamp-1">
          {product.nama}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={
                i < Math.round(avgRating)
                  ? "!text-yellow-500 !fill-yellow-500"
                  : "!text-gray-300"
              }
            />
          ))}
          <span className="text-[11px] !text-gray-500 ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* Harga */}
        <div className="mt-2">
          {product.hargaPromo ? (
            <div className="flex flex-col">
              <span className="text-xs !text-gray-400 line-through">
                Rp {product.harga?.toLocaleString("id-ID") ?? "-"}
              </span>
              <span className="text-sm font-bold !text-red-500">
                Rp {product.hargaPromo.toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold !text-gray-800">
              Rp {product.harga?.toLocaleString("id-ID") ?? "-"}
            </span>
          )}
        </div>

        {/* Tombol Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full !bg-teal-500 !text-white py-1.5 px-3 rounded-md text-xs font-medium hover:!bg-teal-600 transition"
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
