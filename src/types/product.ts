// types/product.ts
import type { Timestamp } from "./common";

export type ProductStatus = "active" | "inactive" | "out_of_stock";

// Review detail
export interface ProductReview {
  user: string;
  bintang?: number;
  komentar?: string;
  rating?: number;
  comment?: string;
}

export interface Category {
  id: string; // dari doc.id Firestore
  name: string; // nama kategori
  imageUrl: string; // gambar untuk homepage
}


// Image object { image1, image2, image3 }
export interface ProductImageSet {
  imageUrl: string;
  alt?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  [key: string]: string | undefined;
}

// Spesifikasi per kategori
export interface ATKSpec {
  jenis: string;
  ukuran: string;
  bahan: string;
}

export interface BannerSpec {
  bahan: string;
  jenis: string;
  finishing: string;
}

export interface BrosurFlyerSpec {
  halaman: number;
  kertas: string;
  finishing: string;
}

export interface CopyPrintSpec {
  kertas: string;
  jenis: string;
  warna: string;
}

export interface NameCardSpec {
  kertas: string;
  finishing: string;
  jenis: string;
}

export interface PackagingSpec {
  bahan: string;
  jenis: string;
  ketebalan: string;
}

export interface PhotoSpec {
  jenis: string;
  bahan: string;
  resolusi: string;
}

export interface StickerLogoSpec {
  bahan: string;
  jenis: string;
  finishing: string;
}

export interface UndanganSpec {
  jenis: string;
  kertas: string;
  finishing: string;
}

// Union semua spesifikasi
export type ProductSpec =
  | ATKSpec
  | BannerSpec
  | BrosurFlyerSpec
  | CopyPrintSpec
  | NameCardSpec
  | PackagingSpec
  | PhotoSpec
  | StickerLogoSpec
  | UndanganSpec;

export interface UnitOption {
  label: string; // contoh: "1 pack (12 pcs)"
  multiplier: number; // contoh: 12
}

export interface Product extends Timestamp {
  id: string;
  category: string;
  nama: string;
  deskripsi: string;

  harga: number;
  hargaBelanja: number;
  hargaPromo?: number | null;

  quantity: number;
  satuan: string;
  ukuran?: string;

  warna?: string[];
  label?: string;
  pengerjaan?: string;
  status: ProductStatus;
  is_recommended?: boolean;

  penilaian?: number;
  rating?: ProductReview[];

  imageUrl: ProductImageSet[];
  unitOptions?: UnitOption[];

  spesifikasi?: ProductSpec;

  /** Alias legacy (opsional) untuk kompatibilitas */
  name?: string;
  price?: number;
}


export interface FirestoreProduct {
  id?: string;
  productId?: string;
  category?: string;

  nama?: string;
  name?: string;

  deskripsi?: string;
  description?: string;

  harga?: number;
  price?: number;

  hargaBelanja?: number;
  
  harga_Promo?: number | null;
  promoPrice?: number | null;

  harga_promo?: number | null;
  promo_price?: number | null;

  imageUrl?: ProductImageSet[] | string[];

  // ✅ tambahan biar ga error
  quantity?: number;
  satuan?: string;
  status?: ProductStatus;
  is_recommended?: boolean;
  penilaian?: number;
  rating?: ProductReview[];
  label?: string;
  pengerjaan?: string;
  warna?: string[];
  unitOptions?: UnitOption[];
  spesifikasi?: ProductSpec;
}


export interface CartItem extends Partial<Product> {
  id: string;
  nama: string;
  harga: number;
  imageUrl: ProductImageSet[];
  cartQuantity: number;
  selected?: boolean;
  unitLabel?: string;

  isCustom?: boolean;
  detail?: {
    kategori?: "design" | "cetak" | "finishing"; // ⬅️ lo pake kategori
    jasa?: string;
    bahan?: string; 
    designUrls?: string[];
    revisi?: number; 
    finishing?: string[]; 
    notes?: string;
  };
}
