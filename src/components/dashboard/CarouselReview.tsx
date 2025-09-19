// src/components/user/CarouselReview.tsx
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../libs/firebase";
import { motion } from "framer-motion";

type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

type Product = {
  id: string;
  nama: string;
  rating: Rating[];
};

const COLLECTIONS: string[] = [
  "ATK",
  "Banner",
  "Books-Agenda",
  "Brosur-Flyer",
  "Calendar",
  "Copy-and-Print",
  "Name-Card-Id",
  "Packaging",
  "Photos",
  "Sticker-Logo",
  "Undangan",
];

const CarouselReview = () => {
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [current, setCurrent] = useState(0);

  // 🔥 Ambil data realtime dari semua koleksi
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    COLLECTIONS.forEach((colName) => {
      const unsub = onSnapshot(collection(db, colName), (snap) => {
        const data = snap.docs.map((d) => d.data() as Product);
        const allRatings = data.flatMap((p) => p.rating || []);
        setReviews((prev) => {
          // gabungin, tapi supaya gak double, kita reset tiap kali load
          const other = prev.filter((r) => !allRatings.includes(r));
          return [...other, ...allRatings];
        });
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  // auto ganti slide tiap 5 detik
  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews]);

  if (!reviews.length) {
    return null;
  }


  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h2 className="text-2xl !text-white font-bold mb-8">
          Apa kata pelanggan kami?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.slice(current, current + 3).map((review, idx) => {
            const initials = review.user
              ? review.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "AN";

            return (
              <motion.div
                key={current + "-" + idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="!bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center"
              >
                {/* Komentar */}
                <p className="!text-gray-600 italic mb-6">
                  “{review.komentar}”
                </p>

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full !bg-teal-600 flex items-center justify-center !text-white font-bold text-lg mb-3">
                  {initials}
                </div>

                {/* Nama */}
                <p className="font-semibold text-lg mb-2">{review.user}</p>

                {/* Bintang + angka */}
                <div className="flex items-center justify-center gap-2">
                  <span className="!text-yellow-500 text-lg">
                    {"★".repeat(review.bintang)}
                    {"☆".repeat(5 - review.bintang)}
                  </span>
                  <span className="px-2 py-0.5 text-white text-xs font-semibold rounded bg-red-500">
                    {review.bintang.toFixed(1)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* indicator disembunyiin */}
        <div className="flex justify-center gap-2 mt-6 opacity-0 pointer-events-none">
          {Array.from({ length: Math.ceil(reviews.length / 3) }).map(
            (_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx * 3)}
                className={`w-3 h-3 rounded-full ${
                  current / 3 === idx ? "bg-teal-600" : "bg-gray-300"
                }`}
              ></button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselReview;
