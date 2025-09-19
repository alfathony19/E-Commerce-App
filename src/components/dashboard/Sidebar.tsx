import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Megaphone,
  Users,
  BarChart,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      category: "Utama",
      items: [
        {
          name: "Dashboard Statistik",
          path: "/admin/dashboard-admin",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          name: "Produk & Jasa",
          path: "/admin/products",
          icon: <Package className="w-5 h-5" />,
        },
        {
          name: "Kelola Orders",
          path: "/admin/orders",
          icon: <ShoppingCart className="w-5 h-5" />,
        },
      ],
    },
    {
      category: "Manajemen",
      items: [
        {
          name: "Promosi & Banner",
          path: "/admin/promotion",
          icon: <Megaphone className="w-5 h-5" />,
        },
        {
          name: "Kelola Users",
          path: "/admin/users",
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: "Kelola Review",
          path: "/admin/reviews",
          icon: <MessageSquare className="w-5 h-5" />,
        },
      ],
    },
    {
      category: "Laporan",
      items: [
        {
          name: "Laporan Penjualan",
          path: "/admin/reports",
          icon: <BarChart className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Tombol toggle untuk mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 !bg-gray-900 !text-gray-100 p-2 rounded-md shadow-md z-50"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 !bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 !bg-gray-900 !text-gray-100 
        flex flex-col z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:fixed`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b !border-gray-800 px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="AM-Print logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-lg font-bold !text-white hidden sm:inline">
              AM-Printing
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden !text-gray-300 hover:!text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
          {menuItems.map((group, idx) => (
            <div key={idx} className="border-b !border-gray-700 pb-2">
              <p className="text-xs font-semibold !text-gray-400 mb-2 px-2 uppercase tracking-wider">
                {group.category}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "!bg-gray-800 !text-white"
                      : "!text-gray-300 hover:!bg-gray-800 hover:!text-white"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Logout - sticky bawah */}
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
