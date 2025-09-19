// src/utils/productMapper.ts
import type {
  Product,
  ProductImageSet,
  ProductReview,
  ProductSpec,
} from "../types/product";
import type { FirestoreProduct } from "../types/firestore";
import { Timestamp } from "firebase/firestore";

// -------- helpers --------
const toIso = (t?: Timestamp | Date | string): string => {
  if (!t) return new Date().toISOString();
  if (typeof t === "string") return t;
  if (t instanceof Date) return t.toISOString();
  if (t instanceof Timestamp) return t.toDate().toISOString();
  return new Date().toISOString();
};

// normalisasi gambar
const safeImageUrl = (src?: unknown): ProductImageSet[] => {
  if (!src || !Array.isArray(src)) return [];

  return src.map((item) => {
    if (typeof item === "string") {
      return { imageUrl: item }; // ✅ samain key
    }

    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        imageUrl:
          (obj.imageUrl as string) ??
          (obj.url as string) ??
          (obj.image1 as string) ??
          "",
        alt: obj.alt as string | undefined,
        image1: obj.image1 as string | undefined,
        image2: obj.image2 as string | undefined,
        image3: obj.image3 as string | undefined,
      };
    }

    return { imageUrl: "" };
  });
};

// normalisasi review
const safeReviews = (src?: unknown): ProductReview[] => {
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

// -------- mapper utama --------
export const mapFirestoreProduct = (
  raw: FirestoreProduct & {
    label?: string;
    pengerjaan?: string;
    warna?: string[];
    spesifikasi?: ProductSpec;
  },
  docId?: string
): Product => {
  return {
    id: raw.productId || docId || "",
    category: raw.category || "",
    nama: raw.nama || raw.name || "Produk Tanpa Nama",
    name: raw.nama || raw.nama || "Produk Tanpa Nama",
    deskripsi: raw.deskripsi || raw.description || "",
    harga: raw.harga ?? raw.price ?? 0,
    price: raw.price ?? raw.harga ?? 0,
    hargaPromo: raw.hargaPromo ?? raw.harga_promo ?? raw.promoPrice ?? null,

    // ✅ aman & ketat type
    imageUrl: safeImageUrl(raw.imageUrl),

    // ✅ review clean
    rating: safeReviews(raw.rating),
    penilaian: raw.penilaian ?? 0,

    status: raw.status ?? "active",
    quantity: raw.quantity ?? 0,
    satuan: raw.satuan ?? "",

    // ✅ gak pake any
    label: raw.label ?? "",
    pengerjaan: raw.pengerjaan ?? "",
    warna: raw.warna ?? [],
    spesifikasi: raw.spesifikasi ?? undefined,

    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
  };
};
