import type { Address, Timestamp } from "./common";

export type OrderStatus =
  | "draft" // baru dibuat
  | "pending" // baru checkout
  | "waiting_verification" // bukti upload, nunggu admin
  | "rejected" // ditolak admin
  | "confirmed" // admin konfirmasi
  | "processing" // sedang diproses
  | "shipped" // dikirim
  | "delivered" // diterima user
  | "completed" // selesai
  | "expired"; // kadaluarsa

export type OrderHistory = {
  status: OrderStatus;
  updatedBy: string;
  timestamp: any;
  photoUrl?: string;
  proof?: string; 
  buktiUrl?: string; 
  receivedPhotoUrl?: string | null; 
};

export interface OrderItem {
  productId?: string; // opsional biar bisa handle SRV custom
  nama: string;
  harga?: number;
  cartQuantity: number;
  subtotal: number;

  srvDetail?: {
    jasa?: string;
    bahan?: string;
    notes?: string;
    designUrls?: string[];
  };
}

export interface CustomerInfo {
  nama: string;
  telepon: string;
  alamat: string;
  email: string;
}

export interface Order extends Timestamp {
  orderId: string;
  userId: string;

  items: OrderItem[];

  subtotal: number; // sebelum diskon
  diskon: number; // potongan harga
  total: number; // subtotal - diskon
  status: OrderStatus;
  promo?: {
    slug: string;
    discount: string;
    discountValue?: number;
  };

  // ✅ payment
  paymentMethod?: "bank_transfer" | "credit_card" | "ewallet" | "cod";
  paymentProof?: string; // URL bukti bayar
  buktiUrl?: string; // URL bukti bayar

  // ✅ shipping
  customer: CustomerInfo;
  shippingAddress: Address;
  shippingTrackingNumber?: string;

  // ✅ timestamps opsional
  confirmedAt?: string;
  completedAt?: string;

  // ✅ admin tools
  receivedPhotoUrl?: string;
  history?: OrderHistory[];

  expiresAt?: any;
  expiredAt?: any;
}
