import { Routes, Route } from "react-router-dom";

// Layout
import PublicLayout from "../layouts/PublicLayout";

// Pages (Landing / Public)
import HomePage from "../pages/landing/HomePage";
import ProductsPage from "../pages/landing/ProductSection";
import HowItsWorksPage from "../pages/landing/HowItsWorksPage";
import AboutPage from "../pages/landing/AboutPage";
import FaqsPage from "../pages/landing/FaqsPage";
import SignUpForm from "../components/form/SignUpForm";
import ContactPage from "../pages/landing/ContactsPage";
import LoginPage from "../components/form/LoginForm";
import UploadPage from "../pages/upload/UploadPage";
import FinishSignInPage from "../pages/auth/FinishSignInPage";
import ProductPublicDetail from "../pages/landing/ProductPublicDetail";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetSuccessPage from "../pages/auth/ResetSuccessPage";
import NotFoundPage from "../pages/auth/NotFoundPage";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/howitsworks" element={<HowItsWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-success" element={<ResetSuccessPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/finishSignIn" element={<FinishSignInPage />} />
        <Route
          path="/product/:category/:id"
          element={<ProductPublicDetail />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
