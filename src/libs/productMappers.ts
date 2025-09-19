import type {
  Product,
  ProductStatus,
  ProductImageSet,
  ProductReview,
} from "../types/product";

const PLACEHOLDER = "/images/placeholder.png";

interface FirestoreProductDoc {
  id: string;
  nama?: string;
  deskripsi?: string;
  harga?: number;
  harga_promo?: number;
  quantity?: number;
  category?: string;
  status?: ProductStatus;
  penilaian?: number; // average rating
  rating?: unknown[]; // reviews array
  label?: string;
  imageUrl?: Array<Record<string, string>>; // Firestore simpan object array
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ✅ helper normalisasi gambar
const safeImageUrl = (
  src?: Array<Record<string, string>>
): ProductImageSet[] => {
  if (!src || src.length === 0) return [{ imageUrl: PLACEHOLDER }];
  return src.map((imgObj) => {
    const url =
      imgObj.imageUrl ||
      imgObj.url ||
      imgObj.image1 ||
      imgObj.image2 ||
      imgObj.image3 ||
      PLACEHOLDER;
    return { imageUrl: url };
  });
};

// ✅ helper normalisasi review
const safeReviews = (src?: unknown[]): ProductReview[] => {
  if (!Array.isArray(src)) return [];
  return src.map((r) => {
    const rv = r as Partial<ProductReview>;
    return {
      user: rv.user ?? "User",
      bintang: rv.bintang ?? rv.rating ?? 0,
      rating: rv.rating ?? rv.bintang ?? 0,
      komentar: rv.komentar ?? rv.comment ?? "",
      comment: rv.comment ?? rv.komentar ?? "",
    };
  });
};

export const mapFirestoreToProduct = (doc: FirestoreProductDoc): Product => {
  return {
    id: doc.id,
    nama: doc.nama ?? "",
    deskripsi: doc.deskripsi ?? "",
    harga: doc.harga ?? 0,
    hargaBelanja: 0, // 🔥 wajib ada (Product butuh ini, bisa isi default / dari Firestore kalau ada)
    hargaPromo: doc.harga_promo ?? null,
    quantity: doc.quantity ?? 0,
    category: doc.category ?? "",
    satuan: "",
    status: doc.status ?? "active",

    // ✅ perbaikan imageUrl → ProductImageSet[]
    imageUrl: safeImageUrl(doc.imageUrl),

    // ✅ review dan penilaian
    rating: safeReviews(doc.rating),
    penilaian: doc.penilaian ?? 0,

    // opsional tambahan
    label: doc.label ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
