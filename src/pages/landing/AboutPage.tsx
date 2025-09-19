import React from "react";
import { FaCheckCircle, FaUsers, FaCogs, FaLeaf } from "react-icons/fa";

const AboutPage: React.FC = () => {
  return (
    <section id="about" className="scroll-mt-16 mt-16 bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Gambar ilustrasi */}
        <div className="flex justify-center">
          <img
            src="/images/printing-office.jpg"
            alt="Percetakan"
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Konten */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Tentang Kami
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Kami adalah perusahaan percetakan yang berkomitmen menghadirkan
            produk cetak berkualitas tinggi dengan harga yang kompetitif. Dengan
            pengalaman bertahun-tahun, kami melayani berbagai kebutuhan mulai
            dari
            <span className="font-semibold">
              {" "}
              kartu nama, brosur, flyer, banner, undangan, stiker, hingga
              packaging
            </span>
            .
          </p>

          {/* Keunggulan */}
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <FaCheckCircle className="text-teal-600 text-xl" />
              <span>
                <strong>Kualitas Terjamin:</strong> Mesin modern & bahan
                terbaik.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <FaUsers className="text-teal-600 text-xl" />
              <span>
                <strong>Tim Profesional:</strong> Siap membantu dari desain
                hingga produksi.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <FaCogs className="text-teal-600 text-xl" />
              <span>
                <strong>Layanan Lengkap:</strong> Cetak cepat, custom, &
                finishing.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <FaLeaf className="text-teal-600 text-xl" />
              <span>
                <strong>Ramah Lingkungan:</strong> Menggunakan tinta & bahan
                eco-friendly.
              </span>
            </li>
          </ul>

          <div className="mt-8">
            <a
              href="/products"
              className="inline-block bg-white !text-teal-600 font-medium px-5 py-2 rounded-lg shadow hover:!text-cyan-700 transition"
            >
              Lihat Produk Kami
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
