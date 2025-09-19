// src/pages/user/NewOrdersPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../libs/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import type { Order, OrderStatus } from "../../types/order";

const tabs: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "draft", label: "Pembayaran Belum Set" },
  { key: "pending", label: "Belum Dikonfirmasi" },
  { key: "waiting_verification", label: "Menunggu Verifikasi" },
  { key: "confirmed", label: "Dikonfirmasi" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "delivered", label: "Diterima" },
  { key: "completed", label: "Selesai" },
  { key: "rejected", label: "Ditolak" },
];

const statusColors: Record<OrderStatus, string> = {
  draft: "!text-orange-500",
  pending: "!text-yellow-500",
  waiting_verification: "!text-blue-500",
  confirmed: "!text-green-600",
  processing: "!text-indigo-500",
  shipped: "!text-purple-500",
  delivered: "!text-teal-500",
  completed: "!text-gray-600",
  rejected: "!text-red-500",
  expired: "!text-pink-500",
};

function NewOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);

  const [draftCount, setDraftCount] = useState<number>(0);

  // ⭐ state untuk review modal
  const [receivedOrder, setReceivedOrder] = useState<Order | null>(null);
  const [receivedPhotoUrl, setReceivedPhotoUrl] = useState<string | null>(null);
  const [uploadingReceived, setUploadingReceived] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewItemId, setReviewItemId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🔎 Realtime fetch orders
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map((doc) => {
        const d = doc.data() as Order;
        return {
          ...d,
          orderId: d.orderId || doc.id,
        };
      });

      setOrders(data);

      // ✅ cek draft orders
      const drafts = data.filter((o) => o.status === "draft");
      setDraftCount(drafts.length);

      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // 🎯 Filter orders
  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  // 🧮 Count function buat dashboard
  const countOrdersByStatus = (status: OrderStatus | "all") => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  // 📸 Handler upload foto review
  const handleUploadReviewPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setUploadedPhotoUrl(localUrl);
  };

  // 🚀 Submit review → simpan ke produk.category/docId.rating[]
  const submitReview = async () => {
    if (!reviewOrder || !reviewItemId) return;
    try {
      setUploading(true);

      // Format productId: "ATK_ATK001"
      const [category, productDocId] = reviewItemId.split("_");

      // ✅ Guard biar ga error kalau format salah
      if (!category || !productDocId) {
        console.error("❌ reviewItemId tidak valid:", reviewItemId);
        setUploading(false);
        return;
      }

      const productRef = doc(db, category, productDocId);

      // 1️⃣ tambah ke array rating
      await updateDoc(productRef, {
        rating: arrayUnion({
          user: user?.uid,
          bintang: rating,
          komentar: comment,
          fotoUrl: uploadedPhotoUrl || null,
          createdAt: serverTimestamp(),
        }),
      });

      // 2️⃣ hitung ulang penilaian (avg)
      const snap = await getDoc(productRef);
      if (snap.exists()) {
        const data = snap.data();
        const ratings = data.rating || [];
        const avg =
          ratings.reduce((sum: number, r: any) => sum + (r.bintang || 0), 0) /
          (ratings.length || 1);

        await updateDoc(productRef, { penilaian: avg });
      }

      // 3️⃣ update order jadi completed
      await updateDoc(doc(db, "orders", receivedOrder!.orderId), {
        status: "completed",
        receivedPhotoUrl: receivedPhotoUrl,
        history: arrayUnion({
          status: "completed", // ✅ fix: jangan delivered
          updatedBy: user?.email || "user",
          timestamp: serverTimestamp(),
          photoUrl: receivedPhotoUrl,
        }),
      });

      // ✅ Reset state
      setReviewOrder(null);
      setComment("");
      setRating(0);
      setUploadedPhotoUrl(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-16 p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Pesanan Saya</h1>

      {draftCount > 0 && (
        <div className="!bg-yellow-50 border !border-yellow-300 !text-yellow-700 p-3 rounded mb-4">
          ⚠️ Kamu punya <strong>{draftCount}</strong> pesanan draft yang belum
          diselesaikan.
          <div className="mt-2 space-y-1">
            {orders
              .filter((o) => o.status === "draft")
              .map((o) => (
                <button
                  key={o.orderId}
                  onClick={() => navigate(`/user/checkout/${o.orderId}`)}
                  className="block underline !text-yellow-800 hover:!text-yellow-900 text-sm"
                >
                  Lanjutkan {o.orderId}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === t.key
                ? "!border-teal-500 !text-teal-600"
                : "!border-transparent !text-gray-500"
            }`}
          >
            {t.label}{" "}
            <span className="ml-1 text-xs text-gray-400">
              ({countOrdersByStatus(t.key)})
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="!text-gray-500 text-center py-10">
          Tidak ada pesanan di kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="!bg-white shadow rounded-lg p-4 sm:p-6"
            >
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="!text-gray-600 text-sm">
                  ID: {order.orderId}
                </span>
                <span
                  className={`text-sm font-medium ${
                    statusColors[order.status] || ""
                  }`}
                >
                  {tabs.find((t) => t.key === order.status)?.label ??
                    order.status}
                </span>
              </div>

              {/* Item list */}
              <div className="space-y-2 mb-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="!bg-gray-50 p-2 rounded">
                    <div className="flex justify-between text-sm !text-gray-700">
                      <span>
                        {item.nama} x{item.cartQuantity}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + action */}
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold !text-gray-800">
                  Total: {formatCurrency(order.total)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/user/orders/${order.orderId}`)}
                    className="px-3 py-1 text-sm !bg-teal-500 !text-white rounded hover:!bg-teal-600"
                  >
                    Lihat Detail
                  </button>

                  {/* Delivered → Upload Bukti */}
                  {order.status === "delivered" && (
                    <button
                      onClick={() => setReceivedOrder(order)}
                      className="px-3 py-1 text-sm !bg-blue-500 !text-white rounded hover:!bg-blue-600"
                    >
                      Pesanan Diterima
                    </button>
                  )}
                  {receivedOrder && (
                    <div className="fixed inset-0 flex items-center justify-center !bg-black/50 z-50">
                      <div className="!bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                          Upload Bukti Penerimaan
                        </h2>

                        {/* Upload Foto */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("image", file);

                            setUploadingReceived(true);
                            try {
                              const res = await fetch(
                                `https://api.imgbb.com/1/upload?key=b8e7c3098b5d082ffab864e87e12d256`,
                                { method: "POST", body: formData }
                              );
                              const data = await res.json();
                              setReceivedPhotoUrl(data.data.url);
                            } finally {
                              setUploadingReceived(false);
                            }
                          }}
                          className="mb-3"
                        />

                        {receivedPhotoUrl && (
                          <img
                            src={receivedPhotoUrl}
                            alt="Preview Bukti"
                            className="w-32 h-32 object-cover rounded mb-3"
                          />
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() => setReceivedOrder(null)}
                            className="px-3 py-1 rounded !bg-gray-200 hover:!bg-gray-300"
                          >
                            Batal
                          </button>
                          <button
                            disabled={!receivedPhotoUrl || uploadingReceived}
                            onClick={async () => {
                              if (!receivedPhotoUrl) return;
                              await updateDoc(
                                doc(db, "orders", receivedOrder.orderId),
                                {
                                  receivedPhotoUrl,
                                  status: "completed", // pesanan selesai
                                  history: arrayUnion({
                                    status: "completed", // ✅ harus sama dengan status di atas
                                    updatedBy: user?.email || "user",
                                    timestamp: serverTimestamp(),
                                    photoUrl: receivedPhotoUrl,
                                  }),
                                }
                              );
                              setReceivedOrder(null);
                              setReceivedPhotoUrl(null);
                            }}
                            className="px-3 py-1 rounded !bg-blue-600 !text-white hover:!bg-blue-700"
                          >
                            {uploadingReceived ? "Mengupload..." : "Simpan"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed → Review */}
                  {order.status === "completed" && (
                    <button
                      onClick={() => {
                        setReviewOrder(order);
                        setReviewItemId(order.items[0]?.productId ?? null);
                      }}
                      className="px-3 py-1 text-sm !bg-green-500 !text-white rounded hover:!bg-green-600"
                    >
                      Beri Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ Modal Review */}
      {reviewOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="!bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Beri Review</h2>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis pengalamanmu..."
              className="w-full border rounded p-2 mb-3"
            />

            {/* Upload Foto */}
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadReviewPhoto}
              className="mb-3"
            />
            {uploadedPhotoUrl && (
              <img
                src={uploadedPhotoUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded mb-3"
              />
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setReviewOrder(null)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={submitReview}
                disabled={uploading}
                className="px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-700"
              >
                {uploading ? "Menyimpan..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewOrdersPage;
