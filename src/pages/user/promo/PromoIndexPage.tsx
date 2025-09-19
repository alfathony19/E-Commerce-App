import { Link } from "react-router-dom";
import { promoData } from "../../../components/promo/promoData";

const PromoIndexPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Semua Promo</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {promoData.map((promo) => (
          <Link
            key={promo.slug}
            to={`/promo/${promo.slug}`}
            className="block bg-white rounded-xl shadow hover:shadow-lg transition p-4"
          >
            <img
              src={promo.image}
              alt={promo.title}
              className="rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold">{promo.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">
              {promo.description}
            </p>
            <p className="mt-2 font-bold text-teal-600">{promo.discount}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PromoIndexPage;
