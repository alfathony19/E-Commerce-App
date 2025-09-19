import type { Product, ProductStatus } from "../types/product";

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
  penilaian?: number;
  rating?: unknown[];
  label?: string;
  imageUrl?: Array<Record<string, string>>; // Firestore simpan object array
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const mapFirestoreToProduct = (doc: FirestoreProductDoc): Product => {
  // Ambil image array dari Firestore
  const imageArray = doc.imageUrl ?? [];
  const images = imageArray.flatMap((imgObj) => Object.values(imgObj));

  // Karena Product butuh [string], pastikan selalu ada minimal 1
  const finalImages: [string] = (
    images.length > 0 ? images : [PLACEHOLDER]
  ) as [string];

  return {
    productId: doc.id,
    name: doc.nama ?? "",
    description: doc.deskripsi ?? "",
    price: doc.harga ?? 0,
    promoPrice: doc.harga_promo,
    stock: doc.quantity ?? 0,
    category: doc.category ?? "",
    imageUrl: finalImages,
    status: doc.status ?? "active",
    rating: doc.penilaian,
    reviewCount: Array.isArray(doc.rating) ? doc.rating.length : 0,
    label: doc.label,
    createdAt: new Date().toISOString(), // atau ambil dari Firestore kalau ada
    updatedAt: new Date().toISOString(),
  };
};
