import ProductList from "../../../components/dashboard/products/ProductList";

function BrochurePage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Brosur-Flyer</h1>
      <ProductList category="Brosur-Flyer" />;
    </div>
  );
}

export default BrochurePage;
