import type { ProductImageSet, ProductReview } from "./product";
import type { Timestamp } from "firebase/firestore";

// 🔥 bentuk mentah produk dari Firestore
export interface FirestoreProduct {
  productId?: string; // biasanya fallback doc.id
  category?: string;
  name?: string; // Firestore simpan "name"
  nama?: string; // Firestore simpan "name"
  description?: string;
  deskripsi?: string;

  price?: number;
  harga?: number;
  promoPrice?: number;
  hargaPromo?: number;
  harga_promo?: number;

  imageUrl?: ProductImageSet[];
  rating?: ProductReview[];
  penilaian?: number;

  status?: "active" | "inactive" | "out_of_stock";

  quantity?: number;
  satuan?: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
