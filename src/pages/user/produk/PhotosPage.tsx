import ProductList from "../../../components/dashboard/products/ProductList";

function PhotosPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Photos</h1>
      <ProductList category="Photos" />;
    </div>
  );
}

export default PhotosPage;
