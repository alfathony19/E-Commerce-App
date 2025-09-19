import ProductList from "../../../components/dashboard/products/ProductList";

function StickerPage() {
  return (
    <div className="mt-11 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">Sticker-Logo</h1>
        <ProductList category="Sticker-Logo" />;
    </div>
  );
}

export default StickerPage;
