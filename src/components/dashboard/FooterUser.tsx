// src/components/common/Footer.tsx
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

const FooterUser = () => {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path);
  };

  const navItems = [
    {
      label: "Produk",
      children: [
        { name: "ATK / Stationery", path: "/user/produk/atk" },
        { name: "Brosur & Flyer", path: "/user/produk/brochure" },
        { name: "Stiker & Logo", path: "/user/produk/sticker-logo" },
        { name: "Kartu Nama", path: "/user/produk/namecard" },
        { name: "Spanduk / Banner", path: "/user/produk/banner" },
        { name: "Undangan", path: "/user/produk/udangan" },
      ],
    },
    {
      label: "Layanan",
      children: [
        { name: "Cetak Offset", path: "/user/layanan/offset" },
        { name: "Digital Printing", path: "/user/layanan/digital" },
        { name: "Desain Grafis", path: "/user/layanan/design" },
        { name: "Jasa Finishing", path: "/user/layanan/finishing" },
      ],
    },
    {
      label: "Promo",
      children: [
        { name: "Tahun Baru", path: "/user/promo/tahun-baru" },
        { name: "Ramadhan", path: "/user/promo/ramadhan" },
        { name: "Hari Kartini", path: "/user/promo/kartini" },
        { name: "Idul Fitri", path: "/user/promo/lebaran" },
        { name: "Hari Kemerdekaan", path: "/user/promo/17an" },
        { name: "Natal", path: "/user/promo/natal" },
      ],
    },
    {
      label: "Tentang Kami",
      children: [
        { name: "Profil Perusahaan", path: "/user/tentang/company-profil" },
        { name: "Kontak", path: "/user/tentang/kontak" },
        { name: "Tim Kami", path: "/user/tentang/tim-member" },
      ],
    },
  ];

  return (
    <footer className="relative bg-gradient-to-r from-teal-500 to-cyan-600 pt-12 pb-6 px-6 text-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 relative z-10">
        {/* Logo & tagline */}
        <div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleAction("/user/dashboard")}
          >
            <img
              src="/images/logo.png"
              alt="AM-Printing logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-white font-bold text-xl">AM-Printing</span>
          </div>
          <p className="text-gray-200 mt-2 text-sm">
            Partner cetak terpercaya untuk bisnis & personal 🖨️
          </p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-4 gap-6 md:col-span-2">
          {navItems.map((menu) => (
            <div key={menu.label}>
              <h4 className="font-semibold mb-3">{menu.label}</h4>
              <ul className="space-y-2 text-sm">
                {menu.children.map((item) => (
                  <li
                    key={item.name}
                    onClick={() => handleAction(item.path)}
                    className="cursor-pointer hover:text-yellow-200"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Kontak & Info */}
        <div className="flex flex-col items-start md:items-end space-y-3 text-sm">
          <a
            href="https://wa.me/6289523475609"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaWhatsapp /> +62 895-2347-5609
          </a>
          <a
            href="mailto:amarmandiriprinting@gmail.com"
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaEnvelope /> amarmandiriprinting@gmail.com
          </a>

          <p className="mt-4 text-xs text-gray-200">
            © 2025 AM-Printing. Semua hak cipta dilindungi.
          </p>
          <p className="text-xs text-gray-200">
            Dibuat dengan ❤ oleh{" "}
            <a href="#" className="hover:text-yellow-200">
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

export default FooterUser;
