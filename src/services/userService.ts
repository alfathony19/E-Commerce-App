// src/services/userService.ts
import { db } from "../libs/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export interface UserAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  address: UserAddress;
  photoURL?: string;
}

export interface UserData {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  photoURL?: string;
  role: "customer" | "admin";
  profile: UserProfile;
  wishlist: string[];
  cart: { productId: string; quantity: number }[];
  createdAt: string;
}

/**
 * Membuat dokumen user baru di Firestore
 */
export async function createUserProfile(uid: string, data: UserData) {
  await setDoc(doc(db, "users", uid), data);
}

/**
 * Ambil data user berdasarkan UID
 */
export async function getUserProfile(uid: string): Promise<UserData | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserData;
}

/**
 * Update sebagian data user
 */
export async function updateUserProfile(uid: string, data: Partial<UserData>) {
  await updateDoc(doc(db, "users", uid), data);
}
