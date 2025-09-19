import React from "react";
import { FaFileUpload, FaPrint, FaTruck } from "react-icons/fa";

const steps = [
  {
    icon: <FaFileUpload />,
    title: "Kirim Desain atau Konsultasi",
    description:
      "Upload file desain Anda atau konsultasikan kebutuhan desain dengan tim kami. Kami siap membantu menyesuaikan desain sesuai kebutuhan cetak.",
  },
  {
    icon: <FaPrint />,
    title: "Proses Cetak & Produksi",
    description:
      "Setelah desain final disetujui, produk akan dicetak menggunakan mesin modern dengan kualitas terbaik dan finishing sesuai permintaan.",
  },
  {
    icon: <FaTruck />,
    title: "Produk Jadi & Pengiriman",
    description:
      "Produk Anda siap! Bisa langsung diambil di tempat kami atau dikirim ke alamat tujuan dengan cepat dan aman.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how"
      className="scroll-mt-16 relative bg-gradient-to-r from-teal-600 to-teal-400 text-white py-16"
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Bagaimana Prosesnya?
        </h2>

        <div className="relative border-l-2 border-teal-200 pl-10 space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start space-x-6">
              {/* Icon bulat */}
              <div className="absolute -left-10 flex items-center justify-center w-10 h-10 rounded-full bg-white text-teal-600 shadow-md">
                <span className="text-lg">{step.icon}</span>
              </div>

              {/* Konten */}
              <div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm opacity-90 mt-2">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="mb-4">Ingin tahu lebih banyak tentang layanan kami?</p>
          <a
            href="https://wa.me/6289523475609"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white !text-teal-600 font-medium px-5 py-2 rounded-lg shadow hover:!text-cyan-700 transition"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
