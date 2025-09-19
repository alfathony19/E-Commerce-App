import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layout
import UserLayout from "../layouts/UserLayout";

// Pages (User Dashboard)
import DashboardPage from "../pages/user/DashboardPage";
// import OrdersPage from "../pages/user/OrdersPage";
// import NewOrderPage from "../pages/user/NewOrderPage";
// import ProfilePage from "../pages/user/ProfilePage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import ProductCart from "../components/dashboard/products/ProductCart";
import CheckoutPage from "../pages/user/CheckoutPage";
import ProfilePage from "../pages/user/ProfilePage";
import ConfirmationPage from "../pages/user/ConfirmationPage";

// Common Components
import LoadingSpinner from "../components/common/LoadingSpinner";
import NewOrdersPage from "../pages/user/NewOrderPage";
import OrderHistoryPage from "../pages/user/OrderHistoryPage";
import ATKPage from "../pages/user/produk/StationeyATK";
import BannerPage from "../pages/user/produk/Banner";
import BrochurePage from "../pages/user/produk/BrochureFlyer";
import PackagingPage from "../pages/user/produk/Packaging";
import UndanganPage from "../pages/user/produk/Invitations";
import NameCardPage from "../pages/user/produk/NameCard";
import StickerPage from "../pages/user/produk/Sticker";
import OffsetPage from "../pages/user/layanan/OffsetPage";
import DigitalPage from "../pages/user/layanan/DigitalPrinting";
import DesignPage from "../pages/user/layanan/DesignPage";
import FinishingPage from "../pages/user/layanan/FinishingPage";
import PromoPage from "../pages/user/promo/PromoPage";
import PromoIndexPage from "../pages/user/promo/PromoIndexPage";
import PhotosPage from "../pages/user/produk/PhotosPage";
import CompanyProfilePage from "../pages/user/about/CompanyProfilePage";
import KontakPage from "../pages/user/about/ContactPage";
import TeamPage from "../pages/user/about/TeamPage";
import NotFoundPage from "../pages/auth/NotFoundPage";




const UserRoutes = () => {
  const { user, isAdmin, loading } = useAuth();

  // 🌀 Kalau masih cek auth state → tampilkan spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // 🚪 Belum login → ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛠 Kalau admin → ke admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cart" element={<ProductCart />} />
        <Route path="checkout/:orderId" element={<CheckoutPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<NewOrdersPage />} />
        <Route path="orders/:id" element={<ConfirmationPage />} />
        <Route path="history" element={<OrderHistoryPage />} />
        <Route path="product/:category/:id" element={<ProductDetailPage />} />

        {/* service */}
        <Route path="layanan/offset" element={<OffsetPage />} />
        <Route path="layanan/digital" element={<DigitalPage />} />
        <Route path="layanan/design" element={<DesignPage />} />
        <Route path="layanan/finishing" element={<FinishingPage />} />
        {/* Produk */}
        <Route path="produk/atk" element={<ATKPage />} />
        <Route path="produk/banner" element={<BannerPage />} />
        {/* <Route path="produk/books" element={<BooksAgendaPage />} /> */}
        <Route path="produk/brochure" element={<BrochurePage />} />
        {/* <Route path="produk/calendar" element={<CalendarPage />} /> */}
        <Route path="produk/undangan" element={<UndanganPage />} />
        <Route path="produk/photos" element={<PhotosPage />} />
        <Route path="produk/namecard" element={<NameCardPage />} />
        <Route path="produk/packaging" element={<PackagingPage />} />
        <Route path="produk/sticker-logo" element={<StickerPage />} />
        {/* Promo */}
        <Route path="promo" element={<PromoIndexPage />} />
        <Route path="promo/:slug" element={<PromoPage />} />
        {/* Tentang */}
        <Route path="tentang/company-profil" element={<CompanyProfilePage />} />
        <Route path="tentang/kontak" element={<KontakPage />} />
        <Route path="tentang/tim-member" element={<TeamPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
