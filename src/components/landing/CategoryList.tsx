"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../libs/firebase";
import CategoryCard from "./CategoryCard";

interface Product {
  category: string;
  nama: string;
  label: string;
  harga: number;
  hargaPromo?: number;
  rating?: number;
  deskripsi?: string;
}

const CATEGORY_COLLECTIONS = [
  "atk",
  "brosur",
  "banner",
  "kartuNama",
  "undangan",
  "stiker",
  "packaging",
  "flyer",
  "poster",
];

const CategoryList = () => {
  const [products, setProducts] = useState<
    { category: string; data: Product[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results: { category: string; data: Product[] }[] = [];

        // 🔥 Loop semua kategori biar muncul semuanya
        for (const col of CATEGORY_COLLECTIONS) {
          const snap = await getDocs(collection(db, col));
          const data: Product[] = snap.docs.map((d) => ({
            ...(d.data() as Omit<Product, "category">),
            category: col,
          }));
          results.push({ category: col, data });
        }

        setProducts(results);
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data produk. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500 animate-pulse">Loading produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((cat, idx) => (
        <CategoryCard
          key={idx}
          title={cat.category.toUpperCase()}
          description={`Total produk: ${cat.data.length}`}
          count={cat.data.length}
        />
      ))}
    </div>
  );
};

export default CategoryList;
