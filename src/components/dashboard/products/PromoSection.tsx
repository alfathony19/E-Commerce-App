import { useEffect, useState } from "react";
import { promoData } from "../../promo/promoData";

const PromoSection = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide tiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promoData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const promo = promoData[current];

  return (
    <section className="mt-11 relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${promo.image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Konten */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full text-white px-3 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg leading-snug">
          {promo.title}
        </h2>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-md md:max-w-2xl drop-shadow">
          {promo.description}
        </p>
        <p className="mt-3 sm:mt-6 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold !text-yellow-300 drop-shadow">
          {promo.discount}
        </p>
      </div>

      {/* Indicator (dot) */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {promoData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full aspect-square transition
        ${idx === current ? "!bg-yellow-400 scale-110" : "bg-white/50"}
        focus:outline-none focus:ring-1 focus:!ring-yellow-400`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoSection;
