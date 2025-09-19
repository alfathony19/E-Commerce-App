import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  name: string;
  imageUrl?: string;
}

const CategoryCard: React.FC<Props> = ({ name, imageUrl }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = `/user/produk/${name.toLowerCase().replace(/\s+/g, "-")}`;
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex items-end justify-center h-40 w-40 rounded-xl shadow-md overflow-hidden cursor-pointer bg-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
      style={{
        backgroundImage: `url(${imageUrl || "/images/default-category.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gradient biar teks keliatan */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity duration-300 hover:opacity-80" />

      {/* Nama kategori */}
      <p className="relative z-10 text-white text-sm font-semibold mb-3 text-center">
        {name}
      </p>
    </div>
  );
};

export default CategoryCard;
