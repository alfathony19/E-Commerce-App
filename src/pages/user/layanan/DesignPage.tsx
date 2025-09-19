
import { Palette, PencilRuler, Layers } from "lucide-react";
import OrderFormJasa from "../../../components/form/OrderFormJasa";

const DesignPage = () => {
  return (
    <div className="mt-7 max-w-7xl mx-auto px-6 py-12">
      {/* Judul */}
      <h1 className="text-4xl font-extrabold text-center !text-gray-900 mb-6 md:mb-12">
        Layanan Desain
      </h1>

      {/* Section Utama */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Gambar (mobile muncul duluan, desktop pindah kanan) */}
        <div className="order-1 md:order-2">
          <img
            src="/images/design-service.jpg"
            alt="Jasa Desain"
            className="rounded-xl shadow-lg w-full"
          />
        </div>

        {/* Konten Teks */}
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
            Jasa Desain Kreatif & Profesional
          </h2>
          <p className="mt-4 !text-gray-600 leading-relaxed">
            Tim kami siap membantu membuat{" "}
            <span className="font-semibold !text-gray-800">
              logo, branding, brosur, katalog, kemasan
            </span>{" "}
            dan berbagai kebutuhan desain grafis lainnya dengan hasil terbaik.
          </p>

          {/* Fitur */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <Palette className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold !text-gray-800">Kreatif</p>
              <p className="text-sm !text-gray-500">
                Ide segar & sesuai tren terbaru
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <PencilRuler className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Custom</p>
              <p className="text-sm text-gray-500">
                Desain sesuai permintaan klien
              </p>
            </div>

            <div className="flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <div className="!bg-indigo-100 p-3 rounded-full mb-3">
                <Layers className="!text-indigo-600 w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800">Editable</p>
              <p className="text-sm text-gray-500">
                File source tersedia untuk revisi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Form Order Layanan Desain
        </h3>
        <OrderFormJasa />
      </div>
    </div>
  );
};

export default DesignPage;
