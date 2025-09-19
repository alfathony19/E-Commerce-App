// src/components/common/Searchbar.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../services/firestore";
import type { Product } from "../../types/product";
import { useAuth } from "../../hooks/useAuth";

interface SearchbarProps {
  mode?: "public" | "user";
  onClose?: () => void; // ✅ biar parent bisa nutup flyout
}

const Searchbar: React.FC<SearchbarProps> = ({ mode = "public", onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 🟢 fetch all products sekali
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await fetchProducts();
        setAllProducts(all);
      } catch (err) {
        console.error("Error fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🟢 filter products realtime
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const filtered = allProducts.filter((p) =>
      p.nama?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 7));
  }, [query, allProducts]);

  // 🟢 klik luar → close flyout
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 🔥 klik suggestion → redirect sesuai role
  const handleSelect = (product: Product) => {
    if (mode === "user" && !user) {
      navigate("/login");
      return;
    }

    const path =
      mode === "user"
        ? `/user/product/${product.category}/${product.id}`
        : `/product/${product.category}/${product.id}`;

    navigate(path, { state: { product } });
    setQuery("");
    setResults([]);
    if (onClose) onClose(); // ✅ close setelah pilih
  };

  const handleSearch = () => {
    if (mode === "user" && !user) {
      navigate("/login");
      return;
    }

    if (results.length > 0) {
      handleSelect(results[0]);
    } else if (query.trim()) {
      const path =
        mode === "user"
          ? `/user/products?search=${query}`
          : `/products?search=${query}`;
      navigate(path);
      if (onClose) onClose(); // ✅ close setelah search
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="flex w-full bg-white rounded-full overflow-hidden shadow-lg">
        <input
          type="text"
          placeholder="Design, ATK, Banner, Sticker ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-grow px-5 py-3 !text-gray-700 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="!bg-teal-500 hover:!bg-teal-600 !text-white px-6 text-sm font-semibold transition"
        >
          Cari
        </button>
      </div>

      {query && results.length > 0 && (
        <ul className="absolute z-50 w-full !bg-white border !border-gray-200 mt-2 rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => handleSelect(p)}
              className="px-5 py-3 cursor-pointer hover:!bg-teal-50 flex justify-between items-center"
            >
              <span className="font-medium !text-gray-800">{p.nama}</span>
              <span className="text-sm !text-gray-500">
                Rp {p.harga?.toLocaleString("id-ID")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {query && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 mt-2 rounded-lg shadow-xl p-4 text-gray-500 text-center">
          Tidak ada produk ditemukan
        </div>
      )}
    </div>
  );
};

export default Searchbar;
