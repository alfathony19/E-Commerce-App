import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product, UnitOption } from "../../../types/product";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../libs/firebase";
import { useAuth } from "../../../hooks/useAuth";
import Dialog from "../../common/Dialog";
import { useCart } from "../../../hooks/useCart";
import { FiUpload } from "react-icons/fi";

type ImageObject = Record<string, string | null | undefined>;
const extractImages = (imageUrl: ImageObject[]): string[] => {
  if (!imageUrl || imageUrl.length === 0) return [];
  const imgs: string[] = [];

  imageUrl.forEach((obj) => {
    Object.values(obj).forEach((val) => {
      if (typeof val === "string" && val.startsWith("http")) {
        imgs.push(val);
      }
    });
  });

  return imgs;
};

// ✅ render star rating
const renderStars = (count: number, onClick?: (val: number) => void) => {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          onClick={() => onClick && onClick(i + 1)}
          className={`w-5 h-5 cursor-pointer ${
            i < count ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

interface Props {
  product: Product;
  unitOptions?: UnitOption;
}
const ProductOverview: React.FC<Props> = ({ product }) => {
  const images = useMemo(() => extractImages(product.imageUrl), [product]);
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.warna?.[0] || "");
  const [reviews, setReviews] = useState(product.rating || []);

  const { user } = useAuth();
  const navigate = useNavigate();

  // form input review
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const { addToCart } = useCart();

  const collectionMap: Record<string, string> = {
    atk: "ATKS",
    banner: "Banner",
    brosur: "BrosurFlyer",
    copyprint: "CopyPrint",
    namecard: "NameCardId",
    packaging: "Packaging",
    photo: "Photo",
    sticker: "StickerLogo",
    undangan: "Undangan",
  };

  // ✅ state tambahan untuk unit pembelian
  const [selectedUnit, setSelectedUnit] = useState(
    product.unitOptions?.[0] || {
      label: product.satuan || "pcs",
      multiplier: 1,
    }
  );

  // hitung rata-rata rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.bintang || r.rating || 0), 0) /
        reviews.length
      : 0;

  // handle submit review
  const handleSubmitReview = async () => {
    if (!user) {
      setDialogOpen(true);
      return;
    }
    if (!newComment.trim() || newRating === 0) return;

    try {
      setUploading(true);
      const newReview = {
        userId: user.uid,
        user: user.displayName || "Anonymous",
        bintang: newRating,
        komentar: newComment,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "reviews"), newReview);

      setReviews([...reviews, newReview]);
      setNewComment("");
      setNewRating(0);
    } catch (err) {
      console.error("Gagal kirim review:", err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ handler Add to Cart baru
  const handleAddToCart = async () => {
    if (!user) {
      setDialogOpen(true);
      return;
    }

    if (product.quantity < selectedUnit.multiplier) {
      alert("Stok tidak cukup!");
      return;
    }

    // 🛒 Add ke cart realtime
    await addToCart({
      id: product.id,
      nama: product.nama,
      harga: product.hargaPromo ?? product.harga ?? 0,
      imageUrl: product.imageUrl,
      cartQuantity: selectedUnit.multiplier,
      selected: true,
      unitLabel: selectedUnit.label,
    });

    // 🔧 Update stok produk di koleksi produk terkait
    const collectionName = collectionMap[product.category];
    if (collectionName) {
      const ref = doc(db, collectionName, product.id);
      await updateDoc(ref, {
        quantity: increment(-selectedUnit.multiplier),
      });
    }
  };

  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Gambar */}
      <div>
        <img
          src={selectedImage}
          alt={product.nama}
          className="w-full rounded-xl border"
        />
        <div className="flex gap-2 mt-4">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(src)}
              className={`h-20 w-20 border rounded-lg ${
                selectedImage === src ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <img
                src={src}
                alt={`${product.nama}-${idx}`}
                className="h-full w-full object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{product.nama}</h2>

        {/* Harga */}
        {product.hargaPromo ? (
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-red-500">
              {formatCurrency(product.hargaPromo)}
            </span>
            <span className="text-sm line-through text-gray-400">
              {formatCurrency(product.harga)}
            </span>
          </div>
        ) : (
          <span className="text-xl font-semibold text-gray-900">
            {formatCurrency(product.harga)}
          </span>
        )}

        {/* Rating rata-rata */}
        <div className="flex items-center gap-2">
          {renderStars(Math.round(avgRating))}
          <span className="text-red-500 font-semibold">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-gray-600 text-sm">
            ({reviews.length} reviews)
          </span>
        </div>

        {/* Deskripsi */}
        <p className="text-gray-600">{product.deskripsi}</p>

        {/* Warna */}
        {product.warna && product.warna.length > 0 && (
          <details className="border rounded-lg p-3">
            <summary className="cursor-pointer font-medium">Warna</summary>
            <div className="flex gap-2 mt-2">
              {product.warna.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border ${
                    selectedColor === color ? "ring-2 !ring-gray-500" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </details>
        )}

        {/* Stok */}
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">Stok</summary>
          <p className="text-gray-600 mt-2">
            {product.quantity} {product.satuan}
          </p>
        </details>

        {/* Spesifikasi */}
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">Spesifikasi</summary>
          <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
            {product.spesifikasi &&
              Object.entries(product.spesifikasi).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium capitalize">{key}</span>:{" "}
                  {value as string}
                </li>
              ))}
          </ul>
        </details>

        {/* Review Shopee-style */}
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">Review</summary>
          <div className="space-y-4 mt-2">
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <div key={i} className="flex gap-3 border-b pb-3">
                  {/* avatar user */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      r.user
                    )}&background=random`}
                    alt={r.user}
                    className="w-10 h-10 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold">{r.user}</p>
                    {/* bintang */}
                    {renderStars(Number(r.bintang) || 0)}
                    {/* komentar */}
                    <p className="text-gray-600 text-sm mt-1">
                      {r.komentar || "Tidak ada komentar"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Belum ada review</p>
            )}
            {/* form tambah review */}
            <div className="space-y-2 pt-4">
              {/* Textarea comment */}
              <textarea
                placeholder="Tulis komentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              />

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Rating:</span>
                {renderStars(newRating, setNewRating)}
              </div>

              {/* Upload media */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg hover:bg-gray-50">
                  <FiUpload className="text-gray-600" />
                  <span className="text-sm">Upload Media</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => setNewMedia(e.target.files?.[0] || null)}
                  />
                </label>
                {newMedia && (
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">
                    {newMedia.name}
                  </span>
                )}
              </div>

              {/* Submit button */}
              <button
                disabled={uploading}
                onClick={handleSubmitReview}
                className="w-full !bg-teal-600 !text-white py-2 rounded-lg hover:!bg-teal-700 transition"
              >
                {uploading ? "Mengirim..." : "Kirim Review"}
              </button>
            </div>
          </div>
        </details>

        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">Satuan</summary>
          <div className="border rounded-lg p-3">
            {product.unitOptions && product.unitOptions.length > 0 ? (
              <>
                <label className="text-sm font-medium">Pilih Satuan</label>
                <select
                  value={selectedUnit.label}
                  onChange={(e) => {
                    const found = product.unitOptions?.find(
                      (u) => u.label === e.target.value
                    );
                    if (found) setSelectedUnit(found);
                  }}
                  className="w-full border rounded p-2 mt-2"
                >
                  {product.unitOptions.map((u) => (
                    <option key={u.label} value={u.label}>
                      {u.label}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-1">
                  = {selectedUnit.multiplier} {product.satuan}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada opsi satuan</p>
            )}
          </div>
        </details>

        {/* Tombol Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full !bg-cyan-600 !text-white py-3 rounded-lg font-medium hover:!bg-cyan-700 transition"
        >
          Add to Cart
        </button>

        {/* Dialog kalau belum login ✅ */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Login Diperlukan"
          message="Anda harus login terlebih dahulu untuk menulis review."
          actionLabel="Login"
          onAction={() => navigate("/login")}
        />
      </div>
    </div>
  );
};

export default ProductOverview;
