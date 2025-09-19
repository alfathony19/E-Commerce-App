import type { PromoItem } from "./promoData";
import { Link } from "react-router-dom";

interface PromoCardProps {
  promo: PromoItem;
}

const PromoCard = ({ promo }: PromoCardProps) => {
  return (
    <div className="relative bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl shadow-lg overflow-hidden text-white flex flex-col md:flex-row items-center">
      {/* Gambar banner */}
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full md:w-1/2 h-64 object-cover"
      />

      {/* Konten promo */}
      <div className="p-8 flex-1 text-center md:text-left">
        <h3 className="text-3xl font-extrabold mb-4">{promo.title}</h3>
        <p className="text-lg mb-4">{promo.description}</p>
        <p className="text-2xl font-bold mb-6">{promo.discount}</p>

        <Link
          to={`/promo/${promo.slug}`}
          className="inline-block bg-white text-teal-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Lihat Promo
        </Link>
      </div>
    </div>
  );
};

export default PromoCard;
