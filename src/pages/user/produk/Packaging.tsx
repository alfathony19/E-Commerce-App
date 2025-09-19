import ProductList from "../../../components/dashboard/products/ProductList";

function PackagingPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Banner</h1>
      <ProductList category="Packaging" />;
    </div>
  );
}

export default PackagingPage;
