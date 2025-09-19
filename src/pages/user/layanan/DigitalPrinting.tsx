// src/pages/layanan/DigitalPrintingPage.tsx
import OrderForm from "../../../components/form/OrderForm";
import { Zap, Clock, Image } from "lucide-react";

const DigitalPage = () => {
  return (
    <div className="mt-7 max-w-7xl mx-auto px-6 py-12">
      {/* Judul */}
      <h1 className="text-4xl font-extrabold text-center !text-gray-900 mb-6 md:mb-12">
        Layanan Kami
      </h1>

      {/* Header Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Gambar (mobile muncul duluan, desktop pindah kanan) */}
        <div className="order-1 md:order-2">
          <img
            src="/images/digital-printing.jpg"
            alt="Digital Printing"
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Konten Teks */}
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
            Digital Printing Cepat & Fleksibel
          </h2>
          <p className="mt-4 !text-gray-600 leading-relaxed">
            Solusi cetak{" "}
            <span className="font-semibold !text-gray-800">
              banner, poster, stiker, brosur
            </span>{" "}
            dan kebutuhan promosi lainnya dengan hasil berkualitas tinggi. Cocok
            untuk jumlah kecil maupun besar dengan waktu pengerjaan yang cepat.
          </p>

          {/* Fitur */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <Zap className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold !text-gray-800">Hasil Tajam</p>
              <p className="text-sm !text-gray-500">
                Resolusi tinggi, warna akurat
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <Clock className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Cepat</p>
              <p className="text-sm text-gray-500">
                Produksi kilat, siap pakai
              </p>
            </div>

            <div className="flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <Image className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Beragam Media</p>
              <p className="text-sm text-gray-500">
                Bisa cetak di kertas, vinyl, stiker, dan lainnya
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Form Order Layanan Digital Printing
        </h3>
        <OrderForm />
      </div>
    </div>
  );
};

export default DigitalPage;
