// services/productService.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../libs/firebase";
import type { Product } from "../types/product";
import { mapFirestoreToProduct } from "../libs/productMappers";

// Ambil semua produk (gabung semua koleksi kategori)
export const getAllProducts = async (): Promise<Product[]> => {
  const categories = [
    "ATK",
    "Banner",
    "Brosur-Flyer",
    "Coppy-and-Print",
    "Name-Card-Id",
    "Packaging",
    "Photos",
    "Sticker-Logo",
    "Undangan",
  ];

  let allProducts: Product[] = [];

  for (const cat of categories) {
    const snap = await getDocs(collection(db, cat));
    const products = snap.docs.map((doc) => mapFirestoreToProduct(doc));
    allProducts = [...allProducts, ...products];
  }

  return allProducts;
};

// Ambil produk by category
export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const snap = await getDocs(collection(db, category));
  return snap.docs.map((doc) => mapFirestoreToProduct(doc));
};
