import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layout
import AdminLayout from "../layouts/AdminLayout";

// Components
import LoadingSpinner from "../components/common/LoadingSpinner";

// Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ManageProductsPage from "../pages/admin/ManageProductsPage";
import ManageOrdersPage from "../pages/admin/ManageOrdersPage";
import ManageUsersPage from "../pages/admin/ManageUsersPage";
import ReportsPage from "../pages/admin/ReportsPage";
import ManageReviewsPage from "../pages/admin/ManageReviewsPage";
import ManagePromotionsPage from "../pages/admin/ManagePromotionsPage";


const AdminRoutes = () => {
  const { user, isAdmin, loading } = useAuth();

  console.log("🧑 User:", user?.email, "Admin?", isAdmin, "Loading?", loading);

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  );
}

// ⛔️ cek user & isAdmin hanya kalau loading selesai
if (!loading && !user) return <Navigate to="/login" replace />;
if (!loading && !isAdmin) return <Navigate to="/" replace />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* ⛔️ HAPUS / di depan path */}
        <Route path="dashboard-admin" element={<AdminDashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reviews" element={<ManageReviewsPage />} />
        <Route path="promotion" element={<ManagePromotionsPage />} />
        <Route path="*" element={<Navigate to="dashboard-admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
