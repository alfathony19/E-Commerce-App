import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { LoadingContext } from "../../contexts/LoadingContext";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { useCart } from "../../hooks/useCart";
import Searchbar from "../common/Searchbar";
// import LoadingSpinner from "../common/LoadingSpinner";

interface UserProfile {
  fullName?: string;
  photoURL?: string;
}

function DashboardHeader() {
  const { user, logout } = useAuth();
  const { isLoading, showLoading, hideLoading } = useContext(LoadingContext)!;
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { cartCount } = useCart();
  const [notifCount, setNotifCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [draftCount, setDraftCount] = useState(0);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Flyout untuk mobile
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartFlyoutOpen, setCartFlyoutOpen] = useState(false);

  // Data profil dari Firestore
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const searchDesktopRef = useRef<HTMLDivElement>(null);
  const searchMobileRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const searchFlyoutRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!user?.uid) return;

  const draftQ = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    where("status", "==", "draft")
  );

  // ⬇️ langsung return unsub nya
  return onSnapshot(draftQ, (snap) => {
    setDraftCount(snap.size);
    if (!snap.empty) {
      setDraftOrderId(snap.docs[0].id);
    } else {
      setDraftOrderId(null);
    }
  });
}, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    // 🔴 Draft orders
    const draftQ = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "==", "draft")
    );
    const unsubDraft = onSnapshot(draftQ, (snap) => {
      setDraftCount(snap.size);
      if (!snap.empty) {
        // ambil draft terbaru (pake [0] aja dulu, bisa ditambah orderBy createdAt kalau mau lebih akurat)
        setDraftOrderId(snap.docs[0].id);
      } else {
        setDraftOrderId(null);
      }
    });

    // 🟢 Pesanan aktif
    const activeQ = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "in", [
        "pending",
        "waiting_verification",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
      ])
    );
    const unsubActive = onSnapshot(activeQ, (snap) => {
      setOrderCount(snap.size);
    });

    // 🔵 History
    const historyQ = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "in", ["confirmed", "completed", "expired", "cancelled"])
    );
    const unsubHistory = onSnapshot(historyQ, (snap) => {
      setHistoryCount(snap.size);
    });

    // 🟡 Notif
    const notifQ = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );
    const unsubNotif = onSnapshot(notifQ, (snap) => {
      setNotifCount(snap.size);
    });

    return () => {
      unsubDraft();
      unsubActive();
      unsubHistory();
      unsubNotif();
    };
  }, [user?.uid]);

  // 🔢 Total semua
  useEffect(() => {
    setTotalCount(orderCount + historyCount + draftCount + notifCount);
  }, [orderCount, historyCount, draftCount, notifCount]);


  // Fetch profile dari Firestore
useEffect(() => {
  const fetchProfile = async () => {
    try {
      if (user?.uid) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as { fullName?: string });
        }
      } else {
        // 🚨 kalau ga ada user → clear cart lokal biar badge ilang
        localStorage.removeItem("cart");
        localStorage.removeItem("persist:cart"); // kalau pake redux-persist
        setProfile(null);
      }
    } catch (err) {
      console.error("Gagal ambil profile Firestore:", err);
    }
  };
  fetchProfile();
}, [user?.uid]);


  // Klik luar → auto close semua flyout
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // ✅ close user menu & cart
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setMobileUserMenuOpen(false);
        setMobileNavOpen(false);
        setCartFlyoutOpen(false);
      }

      // ✅ desktop search: cek icon & flyout
      if (
        searchDesktopRef.current &&
        !searchDesktopRef.current.contains(e.target as Node) &&
        searchFlyoutRef.current &&
        !searchFlyoutRef.current.contains(e.target as Node)
      ) {
        setShowSearch(false);
      }

      // ✅ mobile search
      if (
        searchMobileRef.current &&
        !searchMobileRef.current.contains(e.target as Node)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ wrapper navigate
  const handleNavigate = (path: string) => {
    showLoading();
    navigate(path);
    setTimeout(() => hideLoading(), 500);
  };

  const handleLogout = async () => {
    showLoading();
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout gagal:", err);
    } finally {
      hideLoading();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-teal-500 to-cyan-600">
        {/* <LoadingSpinner /> */}
      </div>
    );
  }

  const mobileNavItems = [
    {
      label: "Products",
      children: [
        { name: "Name Card", path: "/user/produk/namecard" },
        { name: "Brochure/Flyer", path: "/user/produk/brochure" },
        { name: "Banner", path: "/user/produk/banner" },
        { name: "Invitations", path: "/user/produk/udangan" },
        { name: "Packaging", path: "/user/produk/packaging" },
        { name: "Sticker", path: "/user/produk/sticker-logo" },
        { name: "Books/Agenda", path: "/user/produk/books" },
        { name: "Calendar", path: "/user/produk/calendar" },
        { name: "Stationery (ATK)", path: "/user/produk/atk" },
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
        { name: "Imlek", path: "/user/promo/imlek" },
        { name: "Valentine", path: "/user/promo/valentine" },
        { name: "Ramadhan", path: "/user/promo/ramadhan" },
        { name: "Hari Kartini", path: "/user/promo/kartini" },
        { name: "Idul Fitri", path: "/user/promo/lebaran" },
        { name: "Idul Adha", path: "/user/promo/lebaranhaji" },
        { name: "Hari Pendidikan Nasional", path: "/user/promo/hardiknas" },
        { name: "Hari Kemerdekaan", path: "/user/promo/17an" },
        { name: "Hari Sumpah Pemuda", path: "/user/promo/sumpah" },
        { name: "Hari Guru Nasional", path: "/user/promo/hari-guru" },
        { name: "Hari Pahlawan", path: "/user/promo/pahlawan" },
        { name: "Natal", path: "/user/promo/natal" },
      ],
    },

    {
      label: "Tentang Kami",
      children: [
        { name: "Profil", path: "/user/tentang/company-profil" },
        { name: "Kontak", path: "/user/tentang/kontak" },
        { name: "Our Team", path: "/user/tentang/tim-member" },
      ],
    },
  ];

  // Prioritas nama user → Firestore.fullName → Firebase.displayName → "Pengguna"
  const displayName = profile?.fullName ?? user?.displayName ?? "Pengguna";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-teal-500 to-cyan-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center h-16 px-2 py-4 cursor-pointer"
            onClick={() => handleNavigate("/user/dashboard")}
          >
            <img
              src="/images/logo.png"
              alt="AM-Print logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-white">AM-Printing</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6 px-2 py-2 items-center text-white font-medium">
            {mobileNavItems.map((menu) => (
              <div
                key={menu.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(menu.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <span className="cursor-pointer hover:text-yellow-200 capitalize">
                  {menu.label}
                </span>
                {openDropdown === menu.label && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-md mt-1 w-56 py-2 z-50">
                    {menu.children.map((item) => (
                      <span
                        key={item.name}
                        onClick={() => handleNavigate(item.path)}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-6 text-white ml-auto relative">
            {/* Search */}
            <div className="relative" ref={searchDesktopRef}>
              <FaSearch
                size={20}
                className="cursor-pointer hover:text-yellow-200"
                onClick={(e) => {
                  e.stopPropagation(); // ❌ biar gak kena listener global
                  setShowSearch((s) => !s);
                }}
              />

              {showSearch && (
                <div
                  className="absolute top-full mt-2 right-0 w-96 max-w-lg z-50"
                  onClick={(e) => e.stopPropagation()} // ✅ biar ga langsung close
                >
                  <Searchbar mode="user" />
                </div>
              )}
            </div>

            {/* Cart */}
            <div
              className="relative cursor-pointer"
              onClick={() => setCartFlyoutOpen((s) => !s)}
            >
              <FaShoppingCart className="hover:!text-yellow-200" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 !bg-red-500 !text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <FaUser
                size={20}
                className="cursor-pointer hover:!text-yellow-200"
                onClick={() => setMobileUserMenuOpen((s) => !s)}
              />
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2 !bg-yellow-500 !text-white text-xs font-bold px-1 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}

              {mobileUserMenuOpen && (
                <div
                  ref={flyoutRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
                >
                  <div className="px-4 py-2 border-b text-gray-600 font-medium">
                    {displayName}
                  </div>
                  <ul className="text-sm text-gray-700">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleNavigate("/user/profile")}
                    >
                      Akun Saya
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleNavigate("/user/orders")}
                    >
                      Pesanan Saya
                      {orderCount > 0 && (
                        <span className="ml-2 !bg-teal-500 !text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {orderCount}
                        </span>
                      )}
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleNavigate("/user/history")}
                    >
                      Riwayat Pesanan
                      {historyCount > 0 && (
                        <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {historyCount}
                        </span>
                      )}
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        draftOrderId
                          ? handleNavigate(`/user/checkout/${draftOrderId}`)
                          : handleNavigate("/user/cart")
                      }
                    >
                      Pembayaran
                      {draftCount > 0 && (
                        <span className="ml-2 !bg-orange-500 !text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {draftCount}
                        </span>
                      )}
                    </li>

                    <li
                      className="px-4 py-2 !text-red-500 font-semibold hover:!bg-gray-100 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center space-x-4 text-white">
            <div className="relative" ref={searchDesktopRef}>
              <FaSearch
                size={20}
                className="cursor-pointer hover:!text-yellow-200"
                onClick={() => setShowSearch((s) => !s)}
              />

              {showSearch && (
                <div className="absolute top-full mt-2 -right-20 w-72 sm:w-96 z-50">
                  <Searchbar mode="user" />
                </div>
              )}
            </div>

            <div
              className="relative"
              onClick={() => setCartFlyoutOpen((s) => !s)}
            >
              <FaShoppingCart size={20} className="cursor-pointer" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 !bg-red-500 !text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            <button
              onClick={() => setMobileNavOpen((s) => !s)}
              aria-label="Open menu"
            >
              <FaUser size={20} className="cursor-pointer text-gray-800" />
              {totalCount > 0 && (
                <span className="absolute top-2 right-8 !bg-yellow-500 !text-white text-xs font-bold px-1 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Nav + User Menu */}
      {mobileNavOpen && (
        <div
          ref={flyoutRef}
          className="absolute right-4 top-16 w-64 bg-cyan-700 !text-white rounded-xl shadow-lg border p-4 z-50"
        >
          <div className="flex flex-col items-center text-center border-b pb-3 mb-3">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.fullName || "User"}
                className="w-16 h-16 rounded-full object-cover border mb-2"
              />
            ) : user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-16 h-16 rounded-full object-cover border mb-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mb-2">
                {profile?.fullName?.charAt(0) ??
                  user?.displayName?.charAt(0) ??
                  "?"}
              </div>
            )}

            <span className="text-white font-medium">{displayName}</span>
          </div>

          <ul className="space-y-2 text-white ">
            {mobileNavItems.map((menu) => (
              <li key={menu.label} className="relative">
                <div
                  className="flex items-center justify-between cursor-pointer hover:text-yellow-200"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === menu.label ? null : menu.label
                    )
                  }
                >
                  {menu.label}
                  <FaChevronDown
                    size={12}
                    className={`transition-transform ${
                      openDropdown === menu.label ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openDropdown === menu.label && (
                  <ul className="ml-3 mt-1 space-y-1 text-sm">
                    {menu.children.map((item) => (
                      <li
                        key={item.name}
                        className="cursor-pointer hover:!text-yellow-200"
                        onClick={() => {
                          handleNavigate(item.path);
                          setMobileNavOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <hr />

            <li
              onClick={() => {
                handleNavigate("/user/profile");
                setMobileNavOpen(false);
              }}
              className="hover:!text-yellow-200 cursor-pointer"
            >
              Akun Saya
            </li>
            <li
              onClick={() => {
                handleNavigate("/user/orders");
                setMobileNavOpen(false);
              }}
              className="hover:!text-yellow-200 cursor-pointer"
            >
              Pesanan Saya
              {orderCount > 0 && (
                <span className="ml-2 !bg-teal-500 !text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {orderCount}
                </span>
              )}
            </li>
            <li
              onClick={() => {
                handleNavigate("/user/history");
                setMobileNavOpen(false);
              }}
              className="hover:!text-yellow-200 cursor-pointer"
            >
              Riwayat Pesanan
              {historyCount > 0 && (
                <span className="ml-2 !bg-gray-500 !text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {historyCount}
                </span>
              )}
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                draftOrderId
                  ? handleNavigate(`/user/checkout/${draftOrderId}`)
                  : handleNavigate("/user/cart")
              }
            >
              Pembayaran
              {draftCount > 0 && (
                <span className="ml-2 !bg-orange-500 !text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {draftCount}
                </span>
              )}
            </li>

            <li
              onClick={() => {
                handleLogout();
                setMobileNavOpen(false);
              }}
              className="!text-red-500 font-semibold cursor-pointer"
            >
              Logout
            </li>
          </ul>
        </div>
      )}

      {/* Cart Flyout */}
      {cartFlyoutOpen && (
        <div
          ref={flyoutRef}
          className="absolute right-4 top-16 w-72 !bg-white rounded-xl shadow-lg border p-4 z-50"
        >
          <h4 className="font-semibold !text-gray-700 mb-2">Keranjang</h4>
          {cartCount > 0 ? (
            <p className="text-sm !text-gray-500">
              {cartCount} item belum di checkout...
            </p>
          ) : (
            <p className="text-sm !text-gray-400 italic">Keranjang kosong</p>
          )}
          <button
            onClick={() => {
              handleNavigate("/user/cart");
              setCartFlyoutOpen(false);
            }}
            className="mt-3 w-full !bg-teal-500 !text-white py-2 rounded-md"
          >
            Lihat Keranjang
          </button>
        </div>
      )}
    </header>
  );
}

export default DashboardHeader;
