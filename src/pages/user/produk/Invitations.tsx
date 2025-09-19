import ProductList from "../../../components/dashboard/products/ProductList";

function UndanganPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Undangan</h1>
      <ProductList category="Undangan" />;
    </div>
  );
}
export default UndanganPage;
