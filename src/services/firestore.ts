// services/firestore.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../libs/firebase";
import { mapFirestoreProduct } from "../utils/productMapper";
import type { Product } from "../types/product";

const COLLECTIONS = [
  "ATK",
  "Banner",
  "Books-Agenda",
  "Brosur-Flyer",
  "Calendar",
  "Copy-and-Print",
  "Name-Card-Id",
  "Packaging",
  "Photos",
  "Sticker-Logo",
  "Undangan",
];

export async function fetchProducts(): Promise<Product[]> {
  let allProducts: Product[] = [];

  for (const col of COLLECTIONS) {
    const snap = await getDocs(collection(db, col));
    const mapped = snap.docs.map((doc) =>
      mapFirestoreProduct({
        productId: doc.id,
        category: col, // kasih tahu kategori biar jelas
        ...doc.data(),
      })
    );
    allProducts = [...allProducts, ...mapped];
  }

  return allProducts;
}
