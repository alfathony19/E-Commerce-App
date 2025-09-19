
import CategoryPreviews from "../../components/dashboard/products/CategoryPreview";
import ProductList from "../../components/dashboard/products/ProductList";
import PromoSection from "../../components/dashboard/products/PromoSection";


const DashboardPage = () => {
  return (
    <div id="dashboard" className="space-y-12 p-6">
      <PromoSection />
      <CategoryPreviews />
      <ProductList />
    </div>
  );
};

export default DashboardPage;
