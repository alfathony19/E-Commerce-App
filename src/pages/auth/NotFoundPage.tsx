import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  useEffect(() => {
    // 🚀 auto scroll ke atas tiap kali halaman ini dibuka
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center !bg-gray-50 text-center px-6">
      <h1 className="text-7xl font-extrabold !text-teal-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold !text-gray-800 mb-2">
        Halaman Tidak Ditemukan
      </h2>
      <p className="!text-gray-600 mb-6">
        Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-2 !bg-teal-600 !text-white rounded-lg shadow hover:!bg-teal-700 transition"
        >
          Kembali ke Beranda
        </Link>
        <Link
          to="/login"
          className="px-6 py-2 !bg-gray-200 !text-gray-700 rounded-lg shadow hover:!bg-gray-300 transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
