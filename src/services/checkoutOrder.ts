// src/services/checkoutOrder.ts
import { auth, db } from "../libs/firebase";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { Order, CustomerInfo } from "../types/order";
import type { Address } from "../types/common";

export interface CheckoutPayload {
  selectedItems: any[];
  subtotal: number;
  diskon?: number;
  total: number;
  paymentMethod?: "bank_transfer" | "credit_card" | "ewallet" | "cod" | null;
  userData?: any;
  status?: "draft" | "waiting_verification"; // default selalu draft
}

// 🔧 Generate custom OrderId: ORD-dd-mm-yyyy-hhmmss
function generateCustomOrderId(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `ORD-${dd}-${mm}-${yyyy}-${hh}${min}${ss}`;
}

export const checkoutOrder = async ({
  selectedItems,
  subtotal,
  diskon = 0,
  total,
  paymentMethod = null,
  userData,
  status = "draft",
}: CheckoutPayload): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User belum login!");
  }

  // 🛒 Normalisasi items
  const cleanItems = (selectedItems || []).map((item) => ({
    ...item,
    productId: item.id ?? "",
    nama: item.nama ?? item.productName ?? "Produk",
    harga: item.harga ?? item.price ?? 0,
    cartQuantity: item.cartQuantity ?? item.quantity ?? 0,
    subtotal:
      (item.cartQuantity ?? item.quantity ?? 0) *
      (item.harga ?? item.price ?? 0),
  }));

  // 👤 Customer info
  const customer: CustomerInfo = {
    nama: userData?.nama ?? "",
    telepon: userData?.telepon ?? "",
    alamat: userData?.alamat ?? "",
    email: userData?.email ?? user.email ?? "",
  };

  // 📦 Shipping address
  const shippingAddress: Address = {
    street: customer.alamat,
    city: userData?.kota ?? "",
    province: userData?.provinsi ?? "",
    postalCode: userData?.kodePos ?? "",
    country: userData?.negara ?? "Indonesia",
  };

  // 🔧 Generate custom OrderId (selalu unik → jadi bisa punya banyak draft)
  const orderId = generateCustomOrderId();

  // ⏳ Expired time 30 menit dari sekarang
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

  // 📝 Data order final
  const newOrder: Order & {
    userData: CustomerInfo;
    metodePembayaran: string;
    expiresAt: Timestamp;
  } = {
    orderId,
    userId: user.uid,
    items: cleanItems,
    subtotal,
    diskon,
    total,
    status, // draft / waiting_verification
    paymentMethod: paymentMethod as any,
    metodePembayaran: paymentMethod ?? "",
    customer,
    userData: customer,
    shippingAddress,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    expiresAt,
  };

  // 🚀 Simpan ke Firestore → tiap kali checkout selalu dokumen baru
  await setDoc(doc(db, "orders", orderId), newOrder);

  return orderId;
};
