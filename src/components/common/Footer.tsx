// src/components/common/Footer.tsx
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  // 🔥 Samain fungsi kayak di Navbar
  const handleAction = (e: any, target: string) => {
    e.preventDefault();

    if (target === "/") {
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 500);
      }
      return;
    }

    if (target.startsWith("#")) {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const id = target.substring(1);
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 600);
      } else {
        const id = target.substring(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // default: langsung navigate
    navigate(target);
  };

  const navItems = [
    {
      label: "Resources",
      children: [
        { name: "Home", path: "/" },
        { name: "Cara Pesan", path: "#how" },
        { name: "FAQ", path: "#faqs" },
        { name: "Kontak", path: "#contact" },
      ],
    },
    {
      label: "Populer",
      children: [
        { name: "Kartu Nama", path: "/products" },
        { name: "Brosur & Flyer", path: "/products" },
        { name: "Banner", path: "/products" },
        { name: "Undangan", path: "/products" },
      ],
    },
    {
      label: "Promo",
      children: [
        { name: "Tahun Baru", path: "/promo/newyear" },
        { name: "Ramadhan", path: "/promo/ramadhan" },
        { name: "Idul Fitri", path: "/promo/lebaran" },
        { name: "17 Agustus", path: "/promo/17an" },
      ],
    },
    {
      label: "Tentang",
      children: [
        { name: "Profil Perusahaan", path: "/about" },
        { name: "Tim Kami", path: "/team" },
        { name: "Kontak", path: "/contact" },
      ],
    },
  ];

  return (
    <footer className="relative !bg-gradient-to-r !from-teal-500 !to-cyan-600 pt-12 pb-6 px-6 !text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Logo & tagline */}
        <div className="text-center md:text-left">
          <div
            className="flex items-center justify-center md:justify-start gap-2 cursor-pointer"
            onClick={(e) => handleAction(e, "/")}
          >
            <img
              src="/images/logo.png"
              alt="AM-Printing logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="!text-white font-bold text-xl">AM-Printing</span>
          </div>
          <p className="!text-gray-200 mt-2 text-sm font-semibold max-w-xs mx-auto md:mx-0">
            Cetak cepat, hasil berkualitas, harga bersahabat.
          </p>
        </div>

        {/* Navigation */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center md:text-left">
          {navItems.map((menu) => (
            <div key={menu.label}>
              <h4 className="font-semibold mb-3">{menu.label}</h4>
              <ul className="space-y-2 text-sm">
                {menu.children.map((item) => (
                  <li
                    key={item.name}
                    onClick={(e) => handleAction(e, item.path)}
                    className="cursor-pointer hover:!text-yellow-200 transition"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Kontak */}
        <div className="flex flex-col items-center md:items-end space-y-3 text-sm">
          <a
            href="https://wa.me/6289523475609"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:!text-gray-200"
          >
            <FaWhatsapp /> +62 895-2347-5609
          </a>
          <a
            href="mailto:amarmandiriprinting@gmail.com"
            className="flex items-center gap-2 hover:t!ext-gray-200"
          >
            <FaEnvelope /> amarmandiriprinting@gmail.com
          </a>

          <p className="mt-4 text-xs !text-gray-200 text-center md:text-right">
            © 2025 AM-Printing. Semua hak cipta dilindungi.
          </p>
          <p className="text-xs !text-gray-200 text-center md:text-right">
            Dibuat dengan ❤ oleh{" "}
            <a href="#" className="hover:!text-yellow-200">
              Alfathony.19
            </a>
          </p>
        </div>
      </div>

      {/* Decorative corners */}
      <div
        className="absolute bottom-0 right-0 w-32 h-16 bg-gray-200 opacity-30"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      ></div>
      <div
        className="absolute top-0 left-0 w-32 h-16 bg-gray-200 opacity-20"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      ></div>
    </footer>
  );
};

export default Footer;
