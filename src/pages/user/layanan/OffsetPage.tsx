// src/pages/layanan/OffsetPage.tsx
import OrderForm from "../../../components/form/OrderForm";
import { Truck, ShieldCheck, RefreshCcw } from "lucide-react";

const OffsetPage = () => {

  return (
    <div className="mt-7 max-w-7xl mx-auto px-6 py-12">
      {/* Judul */}
      <h1 className="text-4xl font-extrabold text-center !text-gray-900 mb-6 md:mb-12">
        Layanan Kami
      </h1>

      {/* Header Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Gambar (mobile duluan, desktop pindah kanan) */}
        <div className="order-1 md:order-2">
          <img
            src="/images/offset-printing.jpg"
            alt="Cetak Offset"
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Konten */}
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
            Cetak Offset Berkualitas untuk Bisnismu
          </h2>
          <p className="mt-4 !text-gray-600 leading-relaxed">
            Kami menyediakan layanan cetak offset profesional untuk kebutuhan{" "}
            <span className="font-semibold !text-gray-800">
              brosur, katalog, buku, kemasan
            </span>{" "}
            dan lain-lain. Dengan kualitas terbaik dan harga kompetitif, kami
            pastikan hasil cetak sesuai dengan harapan Anda.
          </p>

          {/* Fitur */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="!bg-teal-100 p-3 rounded-full mb-3">
                <Truck className="!text-teal-600 w-6 h-6" />
              </div>
              <p className="font-semibold !text-gray-800">Free Delivery</p>
              <p className="text-sm !text-gray-500">
                Gratis ongkir area tertentu
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="!bg-teal-100 p-3 rounded-full mb-3">
                <ShieldCheck className="!text-teal-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Garansi</p>
              <p className="text-sm text-gray-500">10 tahun kualitas cetak</p>
            </div>

            <div className="flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <div className="!bg-teal-100 p-3 rounded-full mb-3">
                <RefreshCcw className="!text-teal-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Revisi</p>
              <p className="text-sm text-gray-500">
                Revisi desain sebelum produksi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Form Order Layanan Cetak
        </h3>
        <OrderForm />
      </div>
    </div>
  );
};

export default OffsetPage;
