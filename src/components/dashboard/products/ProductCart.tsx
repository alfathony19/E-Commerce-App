import { useNavigate } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import type { CartItem } from "../../../types/product";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../libs/firebase";
import { Trash2 } from "lucide-react";
import { checkoutOrder } from "../../../services/checkoutOrder";

const ProductCart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    toggleItem,
    toggleAll,
    cartCount,
    updateCartQuantity,
    setCart, // pastikan di-expose dari useCart
  } = useCart();

  const [selectAll, setSelectAll] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);


  // ✅ Custom removeFromCart langsung di sini
  const removeFromCart = async (itemId: string, removeAll = true) => {
    if (!user) return;

    const cartItemRef = doc(db, "users", user.uid, "cart", itemId);

    try {
      if (removeAll) {
        // Hapus dari Firestore
        await deleteDoc(cartItemRef);
        // Hapus juga dari state lokal
        setCart((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        // Kalau cuma -1 qty
        setCart((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, cartQuantity: item.cartQuantity - 1 }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Gagal hapus cart:", err);
    }
  };

  useEffect(() => {
    const init: { [key: string]: number } = {};
    cart.forEach((i) => {
      init[i.id] = i.cartQuantity;
    });
  }, [cart]);

  // ✅ Fetch profile user dari Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setProfile(snapshot.data());
      }
    };
    fetchProfile();
  }, [user]);

  // ✅ Auto scroll ke atas tiap buka halaman cart
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-xl font-semibold mb-2">Kamu belum login</h2>
        <p className="text-gray-600 mb-4">
          Silakan login dulu untuk melihat keranjang belanja.
        </p>
        <a href="/login" className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Login
        </a>
      </div>
    );
  }

  if (!cart) return <p>Cart undefined</p>;

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    toggleAll(newValue);
  };

  const totalHarga = cart
    .filter((item) => item.selected)
    .reduce((acc, item) => acc + (item.harga ?? 0) * item.cartQuantity, 0);

  const increaseQty = (item: CartItem) => addToCart(item);
  const decreaseQty = (item: CartItem) =>
    item.cartQuantity > 1
      ? removeFromCart(item.id, false)
      : removeFromCart(item.id, true);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <img
          src="/images/empty-cart.svg" // optional, kalau ada gambar ilustrasi
          alt="Keranjang Kosong"
          className="w-40 h-40"
        />
        <h2 className="text-xl font-semibold">Keranjang Kosong</h2>
        <p className="text-gray-600">Yuk pilih produk dulu sebelum checkout.</p>
        <button
          onClick={() => navigate("/user/dashboard")}
          className="!bg-red-500 !text-white px-6 py-2 rounded-lg hover:!bg-red-600"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // ✅ Navigate ke halaman checkout
  const goToCheckout = async () => {
    if (!profile) {
      alert("Data profil belum siap");
      return;
    }
    if (!user) return;

    const selectedItems = cart.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert("Pilih produk dulu untuk checkout");
      return;
    }

    try {
      // Hitung subtotal
      const subtotal = selectedItems.reduce(
        (acc, item) => acc + (item.harga ?? 0) * item.cartQuantity,
        0
      );

      // 🚀 Pastikan item SRV punya detail kebawa
      const safeItems = selectedItems.map((item) => {
        return {
          id: item.id,
          nama: item.nama,
          harga: item.harga ?? 0,
          cartQuantity: item.cartQuantity,
          imageUrl: item.imageUrl || [],
          isCustom: item.isCustom || false,
          selected: item.selected || false,
          detail: {
            kategori:
              item.detail?.kategori ||
              (item.id.startsWith("SRV") ? "jasa" : "produk"),
            jasa: item.detail?.jasa || "",
            bahan: item.detail?.bahan || "",
            notes: item.detail?.notes || "",
            designUrls: item.detail?.designUrls || [],
          },
        };
      });


      const orderId = await checkoutOrder({
        selectedItems: safeItems,
        subtotal,
        diskon: 0,
        total: subtotal,
        paymentMethod: null,
        userData: {
          nama: profile?.nama || "",
          telepon: profile?.telepon || "",
          alamat: profile?.alamat || "",
          email: profile?.email || user?.email || "",
        },
        status: "draft",
      });

      // Hapus item dari cart Firestore
      for (const item of selectedItems) {
        const cartItemRef = doc(db, "users", user.uid, "cart", item.id);
        await deleteDoc(cartItemRef);
      }

      // Navigate ke checkout page bawa orderId
      navigate(`/user/checkout/${orderId}`);
    } catch (err) {
      console.error("Checkout gagal:", err);
      alert("Checkout gagal, coba lagi bos!");
    }
  };

  return (
    <div className="mt-16 flex flex-col">
      {/* List Produk */}
      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-lg p-3 shadow"
          >
            <input
              type="checkbox"
              checked={!!item.selected}
              onChange={() => toggleItem(item.id)}
            />
            <img
              src={
                Array.isArray(item.imageUrl)
                  ? item.imageUrl[0]?.imageUrl
                  : item.imageUrl || "https://via.placeholder.com/100"
              }
              alt={
                Array.isArray(item.imageUrl)
                  ? item.imageUrl[0]?.alt || item.nama
                  : item.nama
              }
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="text-sm font-medium">{item.nama}</h3>
              <p className="!text-red-500 font-semibold">
                {formatCurrency(item.harga ?? 0)}
              </p>

              {/* ✅ Khusus SRV tampil detail */}
              {item.id.startsWith("SRV") && item.detail && (
                <div className="mt-1 text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>Jasa:</strong> {item.detail.jasa}
                  </p>
                  <p>
                    <strong>Bahan:</strong> {item.detail.bahan}
                  </p>
                  {item.detail.notes && (
                    <p>
                      <strong>Catatan:</strong> {item.detail.notes}
                    </p>
                  )}
                  {(item.detail.designUrls ?? []).map(
                    (url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Design ${i + 1}`}
                        className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setPreviewUrl(url);
                          setZoom(1); // reset zoom tiap buka
                        }}
                      />
                    )
                  )}

                  {previewUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-4 relative max-w-3xl max-h-[90vh] flex flex-col">
                        {/* Tombol Close */}
                        <button
                          onClick={() => setPreviewUrl(null)}
                          className="absolute top-2 right-2 text-red-500 font-bold"
                        >
                          ✕
                        </button>

                        {/* Kontrol Zoom */}
                        <div className="flex justify-center gap-3 mb-2">
                          <button
                            onClick={() =>
                              setZoom((z) => Math.max(0.5, z - 0.1))
                            }
                            className="px-3 py-1 bg-gray-200 rounded"
                          >
                            ➖
                          </button>
                          <button
                            onClick={() => setZoom((z) => z + 0.1)}
                            className="px-3 py-1 bg-gray-200 rounded"
                          >
                            ➕
                          </button>
                          <button
                            onClick={() => setZoom(1)}
                            className="px-3 py-1 bg-gray-200 rounded"
                          >
                            Reset
                          </button>
                        </div>

                        {/* Gambar */}
                        <div className="flex-1 overflow-auto flex items-center justify-center">
                          <img
                            src={previewUrl}
                            alt="Preview Design"
                            style={{
                              transform: `scale(${zoom})`,
                              transition: "transform 0.2s",
                            }}
                            className="max-h-full max-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Qty control */}
              <div className="flex items-center border rounded w-fit mt-2">
                <button
                  onClick={() => decreaseQty(item)}
                  className="px-2 py-1 border-r"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.cartQuantity}
                  min={1}
                  onChange={(e) =>
                    updateCartQuantity(item.id, Number(e.target.value) || 1)
                  }
                  className="w-14 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => increaseQty(item)}
                  className="px-2 py-1 border-l"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id, true)}
              className="!text-red-500 hover:!text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="p-4 border-t bg-white sticky bottom-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span>Pilih Semua</span>
          </div>
          <div className="text-right">
            <p className="text-sm">Total:</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(totalHarga)}
            </p>
          </div>
          <button
            onClick={goToCheckout}
            disabled={totalHarga === 0}
            className="!bg-red-500 !text-white px-6 py-2 rounded-lg disabled:!bg-gray-400 relative"
          >
            Checkout
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 !bg-white !text-red-500 text-xs font-bold rounded-full px-2 py-0.5 shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
