// src/pages/user/promo/PromoPage.tsx
import { useParams } from "react-router-dom";
import { promoData } from "../../../components/promo/promoData";

const PromoPage = () => {
  const { slug } = useParams();
  const promo = promoData.find((p) => p.slug === slug);

  if (!promo) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold">Promo tidak ditemukan</h2>
        <p className="text-gray-600">Coba pilih promo lain dari menu.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 relative w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
        {/* Konten teks */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-4">{promo.title}</h1>
          <p className="text-lg mb-4">{promo.description}</p>
          <div className="text-2xl font-bold mb-6 text-yellow-300">
            {promo.discount}
          </div>
          <button className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow hover:bg-yellow-300 transition">
            Pesan Sekarang
          </button>
        </div>

        {/* Gambar */}
        <div className="flex-1">
          <img
            src={promo.image}
            alt={promo.title}
            className="rounded-xl shadow-lg w-full max-h-96 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoPage;
