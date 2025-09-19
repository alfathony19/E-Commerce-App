// src/pages/landing/CategoryPreview.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryNav from "../../components/common/CategoryNav";
import { useProductsByCategory } from "../../hooks/useProductsByCategory";

// Import icons dari react-icons
import {
  FaPencilAlt,
  FaPrint,
  FaRegEnvelope,
  FaRegCreditCard,
  FaImage,
} from "react-icons/fa";
import { MdStickyNote2, MdOutlineWallpaper } from "react-icons/md";
import { GiCardboardBox, GiNewspaper } from "react-icons/gi";
import LogoClouds from "../../components/common/LogoClouds";

const categories = [
  { key: "ATK", title: "Alat Tulis Kantor", icon: <FaPencilAlt /> },
  { key: "Coppy-and-Print", title: "Print", icon: <FaPrint /> },
  { key: "Photos", title: "Photo", icon: <FaImage /> },
  { key: "Undangan", title: "Undangan", icon: <FaRegEnvelope /> },
  { key: "Banner", title: "Banner", icon: <MdOutlineWallpaper /> },
  { key: "Sticker-Logo", title: "Sticker", icon: <MdStickyNote2 /> },
  { key: "Brosur-Flyer", title: "Brosur", icon: <GiNewspaper /> },
  { key: "Packaging", title: "Packaging", icon: <GiCardboardBox /> },
  { key: "Name-Card-Id", title: "ID Card", icon: <FaRegCreditCard /> },
];

function ProductSection() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].key);
  const { products, loading } = useProductsByCategory(selectedCategory);
  const navigate = useNavigate();

  return (
    <div id="product" className="scroll-mt-16 mt-16 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Cari Produk</h1>
      {/* navigasi kategori */}
      <CategoryNav
        categories={categories}
        active={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* list produk */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${selectedCategory}/${p.id}`)}
              className="cursor-pointer border rounded-lg shadow p-4 hover:shadow-lg"
            >
              <img
                src={p.imageUrl?.[0]?.image1}
                alt={p.nama}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold">{p.nama}</h3>
              <p className="text-sm text-gray-500">
                Rp {p.harga.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <LogoClouds/>
    </div>
  );
}

export default ProductSection;
