import { db } from "../libs/firebase"; // pastikan ini sudah setup
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import type { Product } from "../types/product";
import { mapFirestoreToProduct } from "../libs/productMappers";

const productCollection = collection(db, "products");

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const q = query(productCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) =>
    mapFirestoreToProduct({
      id: docSnap.id,
      ...docSnap.data(),
    })
  );
};

/**
 * Get product by id
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return mapFirestoreToProduct({
    id: docSnap.id,
    ...docSnap.data(),
  });
};

/**
 * Add product
 */
export const addProduct = async (
  product: Omit<Product, "productId" | "createdAt" | "updatedAt">
) => {
  const newDoc = await addDoc(productCollection, {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return newDoc.id;
};

/**
 * Update product
 */
export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, "products", id);

  await updateDoc(docRef, {
    ...product,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string) => {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
};
