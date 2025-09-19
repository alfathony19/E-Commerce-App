import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <header className="fixed-top shrink-0">
        <Sidebar />
      </header>

      {/* Konten kanan */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto lg:pl-64">
        <Outlet />
      </main>
    </div>
  );

};

export default AdminLayout;
