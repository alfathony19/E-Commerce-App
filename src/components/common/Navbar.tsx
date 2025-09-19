import { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { LoadingContext } from "../../contexts/LoadingContext";

const navLinks = [
  { name: "Beranda", path: "/" }, // route
  {
    name: "Produk",
    path: "#product", // scroll
    children: [
      { name: "Kartu Nama", path: "#namecard" },
      { name: "Brosur/Flyer", path: "#brochure" },
      { name: "Banner", path: "#banner" },
      { name: "Undangan", path: "#invitations" },
      { name: "Kemasan", path: "#packaging" },
      { name: "Sticker", path: "#sticker" },
    ],
  },
  { name: "Cara Pesan", path: "#how" },
  { name: "Tentang Kami", path: "#about" },
  { name: "FAQs", path: "#faqs" },
  { name: "Kontak", path: "#contact" },
  {
    name: "Halaman",
    children: [
      { name: "Produk", path: "#product" },
      { name: "Cara Pesan", path: "#how" },
      { name: "Tentang Kami", path: "#about" },
      { name: "FAQs", path: "#faqs" },
      { name: "Kontak", path: "#contact" },
    ],
  },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { showLoading, hideLoading } = useContext(LoadingContext)!;

  // ✅ wrapper navigate biar loading konsisten
  const handleNavigate = (path: string) => {
    showLoading();
    navigate(path);
    setTimeout(() => hideLoading(), 600); // delay biar smooth
    setIsOpen(false);
    setOpenDropdown(null);
  };

  // ✅ Fungsi gabungan scroll / navigate
  const handleAction = (e: React.MouseEvent, target: string) => {
    e.preventDefault();

    if (target === "/") {
      if (window.location.pathname === "/") {
        // ✅ udah di home → scroll ke atas
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // ✅ navigate ke home, scrollTo jalan setelah render
        handleNavigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 500); // kasih delay lebih aman
      }
      return;
    }

    if (target.startsWith("#")) {
      if (window.location.pathname !== "/") {
        // ✅ kalau lagi di luar home → pindah dulu ke home
        handleNavigate("/");
        setTimeout(() => {
          const hash = target.substring(1);
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 600);
      } else {
        // ✅ kalau sudah di home → langsung scroll
        const hash = target.substring(1);
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
      return;
    }

    // ✅ normal route (login, signup, dll)
    handleNavigate(target);

    setIsOpen(false);
    setOpenDropdown(null);
  };

  // ✅ Close menus when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-teal-500 to-cyan-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleAction(e as any, "/")}
          >
            <img
              src="/images/logo.png"
              alt="AM-Print logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-white font-bold text-xl">AM-Printing</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center flex-1">
            <div className="absolute left-1/2 -translate-x-1/2 flex space-x-6">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.name}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(link.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <span
                      onClick={(e) => link.path && handleAction(e, link.path)}
                      className="cursor-pointer text-white hover:text-yellow-200 transition"
                    >
                      {link.name}
                    </span>
                    {openDropdown === link.name && (
                      <div className="absolute top-full left-0 bg-white shadow-lg rounded-md mt-1 w-48 py-2">
                        {link.children.map((child) => (
                          <span
                            key={child.name}
                            onClick={(e) => handleAction(e, child.path)}
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          >
                            {child.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span
                    key={link.name}
                    onClick={(e) => handleAction(e, link.path)}
                    className="cursor-pointer text-white hover:text-yellow-200 transition"
                  >
                    {link.name}
                  </span>
                )
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6 ml-auto">
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex items-center p-0.5"
                >
                  <User className="w-5 h-5 text-black" />
                </button>

                {openUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                    <NavLink
                      to="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate("/login");
                      }}
                      className="block px-4 py-2 text-md !text-gray-800 hover:!text-yellow-200"
                    >
                      Masuk
                    </NavLink>
                    <NavLink
                      to="/signup"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate("/signup");
                      }}
                      className="block px-4 py-2 text-md !text-gray-800 hover:!text-yellow-200"
                    >
                      Daftar
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:text-yellow-500"
            >
              {isOpen ? (
                <X className="text-black" />
              ) : (
                <Menu className="text-black" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div
          ref={mobileNavRef}
          className="md:hidden absolute right-0 top-16 bg-cyan-700 w-56 px-4 py-3 space-y-2 rounded-bl-lg shadow-lg z-50"
        >
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.name} className="relative">
                <span
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.name ? null : link.name
                    )
                  }
                  className="block text-white font-semibold hover:text-yellow-200 cursor-pointer"
                >
                  {link.name}
                </span>

                {openDropdown === link.name && (
                  <div className="absolute top-0 right-full mr-2 bg-cyan-800 rounded-md shadow-lg py-2 w-48 z-50">
                    {link.children.map((child) => (
                      <span
                        key={child.name}
                        onClick={(e) => handleAction(e, child.path)}
                        className="block px-4 py-2 text-white text-sm hover:bg-cyan-600 cursor-pointer"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span
                key={link.name}
                onClick={(e) => handleAction(e, link.path)}
                className="block text-white hover:text-yellow-200 cursor-pointer"
              >
                {link.name}
              </span>
            )
          )}

          {/* Mobile User Flyout */}
          <div className="border-t border-cyan-500 pt-2 mt-2 text-white">
            <span
              onClick={() => handleNavigate("/login")}
              className="block text-md !text-white hover:!text-yellow-200 cursor-pointer"
            >
              Masuk
            </span>
            <span
              onClick={() => handleNavigate("/signup")}
              className="block text-md !text-white hover:!text-yellow-200 cursor-pointer"
            >
              Daftar
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
