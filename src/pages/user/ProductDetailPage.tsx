// src/pages/dashboard/ProductDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Product } from "../../types/product";
import { fetchProducts } from "../../services/firestore";
import ProductOverview from "../../components/dashboard/products/ProductOverview";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth"; // 🔑 import

function ProductDetailPage() {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // ✅ ambil auth state

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !category) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const allProducts = await fetchProducts();
        const found = allProducts.find(
          (p) => p.id === id && p.category === category
        );
        setProduct(found || null);
      } catch (err) {
        console.error("Error fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, category]);

  // 🌀 kalau masih cek auth
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  // 🚪 kalau guest → redirect ke login
  if (!user) {
    navigate("/login");
    return null;
  }

  // ❌ kalau produk gak ada
  if (!product) {
    return <p className="p-6 text-red-500">Product not found</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductOverview product={product} />
    </div>
  );
}

export default ProductDetailPage;
