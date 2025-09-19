import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import {
  getAllProducts,
  getProductsByCategory,
} from "../services/productService";

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data: Product[];
        if (category) {
          data = await getProductsByCategory(category);
        } else {
          data = await getAllProducts();
        }
        setProducts(data);
      } catch (err) {
        console.error("Gagal load produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category]);

  return { products, loading };
}
