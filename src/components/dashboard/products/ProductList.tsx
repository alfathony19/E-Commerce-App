// src/components/dashboard/products/ProductList.tsx
import { useEffect, useState } from "react";
import { fetchProducts } from "../../../services/firestore";
import type { Product } from "../../../types/product";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../../common/LoadingSpinner";

interface ProductListProps {
  category?: string; // ✅ pastikan ada
}

const ProductList: React.FC<ProductListProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let data = await fetchProducts();

        if (category) {
          data = data.filter((p) => p.category === category);
        }

        setProducts(data);
      } catch (err) {
        console.error("Gagal fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Tidak ada produk {category || "apapun"} yang tersedia.
      </p>
    );
  }

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Products</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
