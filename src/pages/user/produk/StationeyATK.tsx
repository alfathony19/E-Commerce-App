import ProductList from "../../../components/dashboard/products/ProductList";

function ATKPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">ATK</h1>
        <ProductList category="ATK" />;
    </div>
  );
}

export default ATKPage;
