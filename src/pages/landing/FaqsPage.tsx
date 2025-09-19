import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Berapa lama waktu pengerjaan percetakan?",
    answer:
      "Waktu pengerjaan tergantung jenis produk. Rata-rata 2-3 hari kerja untuk produk standar, sementara produk custom bisa lebih lama.",
  },
  {
    question: "Apakah bisa pesan dalam jumlah sedikit?",
    answer:
      "Tentu saja! Kami menerima pesanan dari jumlah kecil hingga dalam jumlah besar sesuai kebutuhan Anda.",
  },
  {
    question: "Apakah ada layanan desain?",
    answer:
      "Ya, tim desain kami siap membantu membuat atau menyesuaikan desain sesuai permintaan sebelum proses cetak.",
  },
  {
    question: "Apakah bisa request ukuran custom?",
    answer:
      "Bisa, kami menerima cetakan dengan ukuran custom sesuai kebutuhan Anda.",
  },
  {
    question: "Apakah melayani pengiriman?",
    answer:
      "Ya, kami menyediakan layanan pengiriman ke seluruh Indonesia menggunakan kurir terpercaya.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima pembayaran melalui transfer bank, e-wallet, dan pembayaran tunai di tempat.",
  },
];

const FaqsPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="scroll-mt-16 bg-cyan-600 py-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* FAQ List */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex justify-between items-center p-4 text-left text-gray-800 font-medium hover:bg-gray-50"
                >
                  {faq.question}
                  <FaChevronDown
                    className={`transform transition-transform ${
                      openIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer */}
                {openIndex === idx && (
                  <div className="p-4 text-gray-600 border-t bg-gray-50 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gambar di kanan */}
        <div className="flex justify-center">
          <img
            src="/images/5272897.png"
            alt="FAQ Illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default FaqsPage;
