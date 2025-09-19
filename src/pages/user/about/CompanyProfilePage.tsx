import { motion } from "framer-motion";
import {
  CheckCircle2,
  Smartphone,
  Upload,
  Clock,
  CreditCard,
  Truck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

// Company Profile Page – Printing App
// Sections: 1) Hero, 2) About, 3) Vision & Mission, 4) App Features, 5) Products & Services
// Theme: white background, teal accents, clean cards, soft shadows, large rounded corners
// Drop into your routes/pages and render <CompanyProfilePage />

function CompanyProfilePage() {
  const features = [
    {
      icon: Smartphone,
      title: "Pemesanan Online",
      desc: "Pesan produk cetak langsung dari aplikasi, kapan pun.",
    },
    {
      icon: Upload,
      title: "Upload Desain Instan",
      desc: "Unggah file desain dengan aman & terstruktur.",
    },
    {
      icon: Clock,
      title: "Tracking Real‑Time",
      desc: "Pantau progres: produksi, QC, hingga pengiriman.",
    },
    {
      icon: CreditCard,
      title: "Pembayaran Lengkap",
      desc: "Transfer bank, e‑wallet, hingga COD sesuai kebutuhan.",
    },
    {
      icon: Truck,
      title: "Pengiriman Cepat",
      desc: "Ekspedisi tepercaya, opsi same‑day/next‑day (wilayah tertentu).",
    },
    {
      icon: SlidersHorizontal,
      title: "Kustomisasi Fleksibel",
      desc: "Atur ukuran, bahan, dan finishing sesuai brief.",
    },
  ];

  const products = [
    {
      title: "Kartu Nama & Undangan",
      desc: "Cetak premium dengan banyak opsi kertas & finishing.",
    },
    {
      title: "Brosur, Flyer, & Poster",
      desc: "Promosi maksimal, warna tajam & konsisten.",
    },
    {
      title: "Spanduk, Banner, & X‑Banner",
      desc: "Indoor/Outdoor, material kuat & tahan cuaca.",
    },
    {
      title: "Stiker, Label, & Packaging",
      desc: "Branding produk yang rapi & menonjol.",
    },
    {
      title: "Buku, Majalah, & Kalender",
      desc: "Jilid rapi, cetak offset & digital siap skala.",
    },
    {
      title: "Merchandise Cetak",
      desc: "Kaos, totebag, mug—cocok untuk komunitas & kampanye.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,teal,transparent_35%),radial-gradient(circle_at_80%_30%,cyan,transparent_30%),radial-gradient(circle_at_50%_80%,teal,transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pb-28 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm text-teal-700 ring-1 ring-teal-200">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Printing Solution • Digital First</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-gray-900">
              CV Amar Mandiri <br></br> Percetakan Modern Berbasis Aplikasi
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
              Menggabungkan teknologi digital dengan kualitas cetak profesional
              untuk bisnis, komunitas, dan kebutuhan personal. Satu aplikasi,
              seribu solusi.
            </p>
            <div className="mt-5 flex justify-center">
              <img
                src="/images/printing-office.jpg"
                alt="Percetakan"
                className="w-1/2 max-w-md h-auto rounded-2xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main card container */}
      <main className="mx-auto -mt-12 max-w-7xl px-6 pb-24 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 sm:p-10">
          {/* 1. Tentang Kami */}
          <SectionTitle index={1} title="Tentang Kami" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600"
          >
            <strong>CV Amar Mandiri</strong> <br></br>adalah perusahaan
            percetakan modern yang menggabungkan <em>teknologi digital</em>{" "}
            dengan layanan cetak profesional. Dengan tim kreatif dan mesin
            mutakhir, kami melayani kebutuhan cetak dari skala personal hingga
            korporasi—mengutamakan kecepatan, presisi warna, dan konsistensi.
          </motion.p>

          <Divider />

          {/* 2. Visi & Misi */}
          <SectionTitle index={2} title="Visi & Misi" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <GlassCard>
              <h3 className="text-xl font-semibold text-teal-700">Visi</h3>
              <p className="mt-2 text-gray-600">
                Menjadi mitra percetakan digital terdepan yang menghadirkan
                kemudahan, kualitas, dan inovasi untuk setiap kebutuhan cetak.
              </p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-xl font-semibold text-teal-700">Misi</h3>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />{" "}
                  Menyediakan layanan percetakan berbasis aplikasi yang cepat,
                  mudah, dan transparan.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />{" "}
                  Memberikan hasil cetak berkualitas tinggi dengan harga
                  kompetitif.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />{" "}
                  Menghadirkan inovasi digital dari pemesanan hingga pengiriman.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />{" "}
                  Membangun hubungan jangka panjang lewat pelayanan terbaik.
                </li>
              </ul>
            </GlassCard>
          </div>

          <Divider />

          {/* 3. Fitur Aplikasi */}
          <SectionTitle index={3} title="Fitur Aplikasi" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-start gap-3">
                    <f.icon className="h-6 w-6 text-teal-600 drop-shadow-sm" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {f.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <Divider />

          {/* 4. Produk & Layanan */}
          <SectionTitle index={4} title="Produk & Layanan" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <GlassCard className="h-full">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">{p.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ index, title }: { index: number; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 text-white font-bold shadow-md">
        {index}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export default CompanyProfilePage;