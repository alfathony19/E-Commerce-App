// components/common/HeroSection.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryCard from "../landing/CategoryCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../libs/firebase";
import Searchbar from "./Searchbar";
import CarouselReview from "../dashboard/CarouselReview";


// 🔥 Bentuk data asli dari Firestore
interface FirestoreProduct {
  nama: string;
  harga: number;
  harga_promo?: number;
  penilaian?: number;
  deskripsi?: string;
  label?: string;
  large?: boolean;
  imageUrl?:
    | { image1?: string; image2?: string; image3?: string }
    | { image1?: string; image2?: string; image3?: string }[];
  rating?: { user: string; bintang: number; komentar?: string }[];
}

// 🔥 Bentuk data yang dipakai komponen
interface Product {
  id: string;
  category: string;
  nama: string;
  label?: string;
  harga: number;
  hargaPromo?: number;
  rating?: number; // rata-rata bintang
  deskripsi?: string;
  image?: string;
  large?: boolean;
}

const HeroSection = () => {
  const [leftCards, setLeftCards] = useState<Product[]>([]);
  const [rightCards, setRightCards] = useState<Product[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  // 🔥 Fetch data Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const collections = [
        "ATK",
        "Banner",
        "Brosur-Flyer",
        "Coppy-and-Print",
        "Name-Card-Id",
        "Packaging",
        "Photos",
        "Sticker-Logo",
        "Undangan",
      ];

      let allData: Product[] = [];

      for (const col of collections) {
        const snapshot = await getDocs(collection(db, col));

        const data = snapshot.docs.map((doc) => {
          const raw = doc.data() as FirestoreProduct;

          // ambil gambar
          let image = "";
          if (Array.isArray(raw.imageUrl)) {
            image = raw.imageUrl[0]?.image1 || "";
          } else if (raw.imageUrl && typeof raw.imageUrl === "object") {
            image = raw.imageUrl.image1 || "";
          }

          // hitung rata-rata rating
          let avgRating = raw.penilaian;
          if (!avgRating && raw.rating && raw.rating.length > 0) {
            avgRating =
              raw.rating.reduce((sum, r) => sum + r.bintang, 0) /
              raw.rating.length;
          }

          return {
            id: doc.id,
            category: col,
            nama: raw.nama,
            harga: raw.harga,
            hargaPromo: raw.harga_promo,
            rating: avgRating,
            deskripsi: raw.deskripsi,
            label: raw.label,
            large: raw.large,
            image,
          } as Product;
        });

        allData = [...allData, ...data];
      }

      // pisah kiri & kanan
      const leftCategories = ["ATK", "Photos", "Name-Card-Id", "Sticker-Logo"];
      const rightCategories = [
        "Banner",
        "Brosur-Flyer",
        "Coppy-and-Print",
        "Packaging",
        "Undangan",
      ];

      setLeftCards(allData.filter((p) => leftCategories.includes(p.category)));
      setRightCards(
        allData.filter((p) => rightCategories.includes(p.category))
      );
    };

    fetchProducts();
  }, []);

  // 🔥 auto-slide tiap 8 detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (leftCards.length > 0)
        setLeftIndex((prev) => (prev + 1) % leftCards.length);
      if (rightCards.length > 0)
        setRightIndex((prev) => (prev + 1) % rightCards.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [leftCards, rightCards]);

  return (
    <div
      id="home"
      className="mt-15 relative w-full overflow-x-hidden bg-gradient-to-b !from-cyan-600 !via-teal-400 !to-teal-500 pb-20"
    >
      <div className="max-w-screen-xl mx-auto text-center pt-20 px-4">
        {/* Judul */}
        <h1 className="text-4xl md:text-5xl font-bold !text-white mb-2">
          Cetak apa pun Lebih Mudah dan Cepat
        </h1>
        <p className="!text-white text-lg mb-8">
          Dari kartu nama hingga spanduk besar, kami dapat mencetak dengan
          kualitas tinggi.
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <Searchbar />
        </div>

        {/* Grid Cards 2 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card */}
          <AnimatePresence mode="wait">
            {leftCards[leftIndex] && (
              <motion.div
                key={leftCards[leftIndex].id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
              >
                <CategoryCard
                  title={leftCards[leftIndex].nama}
                  description={leftCards[leftIndex].deskripsi || ""}
                  price={leftCards[leftIndex].harga}
                  promoPrice={leftCards[leftIndex].hargaPromo}
                  rating={leftCards[leftIndex].rating}
                  category={leftCards[leftIndex].category}
                  image={leftCards[leftIndex].image}
                  large={leftCards[leftIndex].large}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Card */}
          <AnimatePresence mode="wait">
            {rightCards[rightIndex] && (
              <motion.div
                key={rightCards[rightIndex].id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
              >
                <CategoryCard
                  title={rightCards[rightIndex].nama}
                  description={rightCards[rightIndex].deskripsi || ""}
                  price={rightCards[rightIndex].harga}
                  promoPrice={rightCards[rightIndex].hargaPromo}
                  rating={rightCards[rightIndex].rating}
                  category={rightCards[rightIndex].category}
                  image={rightCards[rightIndex].image}
                  large={rightCards[rightIndex].large}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CarouselReview />
    </div>
  );
};

export default HeroSection;
