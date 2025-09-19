import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

// Contact Page – Printing App
// Epic style, consistent with CompanyProfilePage
// Theme: white background, teal accent, clean layout

 function KontakPage() {
  const contacts = [
    { icon: Phone, label: "Telepon", value: "+62 895-2347-5609" },
    { icon: Mail, label: "Email", value: "amarmandiri@gmail.com" },
    {
      icon: MapPin,
      label: "Alamat",
      value: "Jl. Kapt Hanafiah Karanganyar Depan gate Perum BSK Kp.Rawabadak Subang, Jawbarat",
    },
    { icon: Globe, label: "Website", value: "www.amdprint.ac.id" },
  ];

  const socials = [
    { icon: Facebook, name: "Facebook", url: "#" },
    { icon: Instagram, name: "Instagram", url: "#" },
    { icon: Twitter, name: "Twitter", url: "#" },
    { icon: Linkedin, name: "LinkedIn", url: "#" },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,teal,transparent_35%),radial-gradient(circle_at_80%_30%,cyan,transparent_30%),radial-gradient(circle_at_50%_80%,teal,transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gray-900"
          >
            Hubungi Kami
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Kami siap membantu semua kebutuhan percetakan Anda. Hubungi kami
            melalui kontak berikut atau ikuti media sosial kami untuk update
            terbaru.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <main className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Informasi Kontak
            </h2>
            <ul className="mt-6 space-y-5">
              {contacts.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  <c.icon className="h-6 w-6 !text-teal-600 drop-shadow-sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {c.label}
                    </p>
                    <p className="text-gray-600">{c.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900">Media Sosial</h2>
            <p className="mt-2 text-gray-600">
              Ikuti kami untuk berita dan promo terbaru.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm hover:!border-teal-400 hover:bg-teal-50 transition"
                >
                  <s.icon className="h-7 w-7 !text-teal-600 drop-shadow-sm" />
                  <span className="mt-2 text-sm font-medium text-gray-700">
                    {s.name}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Optional Map Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 overflow-hidden rounded-3xl shadow-xl ring-1 ring-gray-200"
        >
          <iframe
            title="Company Location"
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3963.698336465148!2d107.78088757499317!3d-6.559711493433444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwMzMnMzUuMCJTIDEwN8KwNDcnMDAuNSJF!5e0!3m2!1sid!2sid!4v1757215824309!5m2!1sid!2sid"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
          ></iframe>
        </motion.div>
      </main>
    </div>
  );
}

export default KontakPage;