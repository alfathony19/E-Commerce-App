import { Scissors, Package, BadgeCheck } from "lucide-react";
import OrderFormJasa from "../../../components/form/OrderFormJasa";

const FinishingPage = () => {
  return (
    <div className="mt-7 max-w-7xl mx-auto px-6 py-12">
      {/* Judul */}
      <h1 className="text-4xl font-extrabold text-center !text-gray-900 mb-6 md:mb-12">
        Layanan Finishing
      </h1>

      {/* Header Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Gambar (mobile duluan, desktop pindah kanan) */}
        <div className="order-1 md:order-2">
          <img
            src="/images/finishing-service.jpg"
            alt="Layanan Finishing"
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Konten */}
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
            Finishing Berkualitas untuk Produk Cetak
          </h2>
          <p className="mt-4 !text-gray-600 leading-relaxed">
            Kami menyediakan berbagai pilihan finishing{" "}
            <span className="font-semibold !text-gray-800">
              laminasi, spot UV, emboss, jilid, lipat
            </span>{" "}
            agar hasil cetakan Anda lebih menarik & profesional.
          </p>

          {/* Fitur */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="!bg-orange-100 p-3 rounded-full mb-3">
                <Scissors className="!text-orange-600 w-6 h-6" />
              </div>
              <p className="font-semibold !text-gray-800">Presisi</p>
              <p className="text-sm !text-gray-500">
                Pemotongan & lipatan akurat
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="!bg-orange-100 p-3 rounded-full mb-3">
                <Package className="!text-orange-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Variatif</p>
              <p className="text-sm text-gray-500">
                Banyak pilihan finishing sesuai kebutuhan
              </p>
            </div>

            <div className="flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <div className="!bg-orange-100 p-3 rounded-full mb-3">
                <BadgeCheck className="!text-orange-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Premium</p>
              <p className="text-sm text-gray-500">
                Tampilan lebih mewah & eksklusif
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Form Order Layanan Finishing
        </h3>
        <OrderFormJasa />
      </div>
    </div>
  );
};

export default FinishingPage;
