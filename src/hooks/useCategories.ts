import { useEffect, useState } from "react";
import { fetchProducts } from "../services/firestore";
import type { Product } from "../types/product";

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

const formatName = (col: string) =>
  col.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const products: Product[] = await fetchProducts(); // ✅ pakai ini

        const categoryMap = new Map<string, string>();

        products.forEach((p) => {
          if (!categoryMap.has(p.category) && p.imageUrl?.length > 0) {
            const firstImage =
              typeof p.imageUrl[0] === "string"
                ? p.imageUrl[0]
                : p.imageUrl[0]?.imageUrl || "/placeholder.png";

            categoryMap.set(p.category, firstImage);
          }
        });

        const result: Category[] = Array.from(categoryMap).map(
          ([name, imageUrl]) => ({
            id: name,
            name: formatName(name),
            imageUrl,
          })
        );

        setCategories(result);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
