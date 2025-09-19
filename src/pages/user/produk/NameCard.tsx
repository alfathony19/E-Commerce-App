import ProductList from "../../../components/dashboard/products/ProductList";

function NameCardPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Id Card/Name Card</h1>
      <ProductList category="Name-Card-Id" />;
    </div>
  );
}

export default NameCardPage;
