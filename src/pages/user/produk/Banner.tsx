import ProductList from "../../../components/dashboard/products/ProductList";

function BannerPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Banner</h1>
      <ProductList category="Banner" />
    </div>
  );
}

export default BannerPage;
