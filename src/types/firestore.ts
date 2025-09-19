import type {
  ProductImageSet,
  ProductReview,
  ProductSpec,
  UnitOption,
} from "./product";
import type { Timestamp } from "firebase/firestore";

// 🔥 bentuk mentah produk dari Firestore
export interface FirestoreProduct {
  id?: string; // doc.id fallback
  productId?: string;

  category?: string;

  // nama & deskripsi
  name?: string;
  nama?: string;
  description?: string;
  deskripsi?: string;

  // harga-harga
  price?: number;
  harga?: number;
  hargaBelanja?: number; // ✅ WAJIB ada (Product butuh ini)
  promoPrice?: number | null;
  hargaPromo?: number | null;
  harga_promo?: number | null; // snake_case
  promo_price?: number | null; // snake_case

  // media
  imageUrl?: ProductImageSet[] | string[];

  // rating & penilaian
  rating?: ProductReview[] | unknown[];
  penilaian?: number;

  // status
  status?: "active" | "inactive" | "out_of_stock";

  // stok & unit
  quantity?: number;
  satuan?: string;

  // optional lain
  label?: string;
  pengerjaan?: string;
  warna?: string[];
  unitOptions?: UnitOption[];
  spesifikasi?: ProductSpec;

  // timestamp
  createdAt?: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
}
