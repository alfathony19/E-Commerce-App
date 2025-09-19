// hooks/useProductsByCategory.ts
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../libs/firebase";

export interface Product {
  id: string;
  category: string;
  nama: string;
  penilaian: number;
  imageUrl: { [key: string]: string }[]; // image1, image2, ...
  label: string;
  harga: number;
  harga_promo?: number;
  deskripsi: string;
}

export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, category), limit(3)); // 🔥 ambil cuma 3
        const snap = await getDocs(q);
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(items);
      } catch (err) {
        console.error("Error fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return { products, loading };
};
