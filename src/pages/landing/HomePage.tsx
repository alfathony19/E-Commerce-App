// pages/landing/HomePage.tsx
import HeroSection from "../../components/common/HeroSection";
import HowItWorks from "./HowItsWorksPage";
import AboutPage from "./AboutPage";
import FaqsPage from "./FaqsPage";
import ContactPage from "./ContactsPage";
import ProductSection from "./ProductSection";
// import LoadingSpinner from "../../components/common/LoadingSpinner";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProductSection />
      <HowItWorks />
      <AboutPage />
      <FaqsPage />
      <ContactPage />
    </>
  );
};

export default HomePage;
