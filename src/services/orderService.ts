// src/services/orderService.ts
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../libs/firebase";
import type { OrderStatus } from "../types/order";

export interface OrderData {
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    qty: number;
  }[];
  totalPrice: number;
  paymentMethod: string;
  address: string;
}

// ✅ Buat order baru
export const createOrder = async (orderData: OrderData) => {
  try {
    // Generate resi otomatis
    const resi = "INV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      resi,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, resi };
  } catch (error) {
    console.error("Error createOrder:", error);
    throw error;
  }
};

// ✅ Update status + simpan history
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  updatedBy: string,
  photoUrl?: string
) => {
  try {
    const ref = doc(db, "orders", orderId);
    await updateDoc(ref, {
      status,
      history: arrayUnion({
        status,
        updatedBy,
        timestamp: serverTimestamp(),
        ...(photoUrl ? { photoUrl } : {}), // optional foto
      }),
      updatedAt: serverTimestamp(),
      ...(photoUrl ? { receivedPhotoUrl: photoUrl } : {}),
    });
  } catch (error) {
    console.error("Error updateOrderStatus:", error);
    throw error;
  }
};
