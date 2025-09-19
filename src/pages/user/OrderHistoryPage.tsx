import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../libs/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt?: any;
  items?: {
    nama: string;
    harga: number;
    cartQuantity: number;
  }[];
};

const statusColors: Record<string, string> = {
  completed: "!text-green-600",
  cancelled: "!text-red-500",
  expired: "!text-gray-400",
};

function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0); // ✅ notif count

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // hanya ambil riwayat final
      const filtered = data.filter((o) =>
        ["completed", "cancelled", "expired"].includes(o.status)
      );

      setOrders(filtered);
      setCount(filtered.length); // ✅ hitung jumlah notif
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="mt-16 p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Riwayat Pesanan</h1>
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          Belum ada riwayat pesanan.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-4 sm:p-6"
            >
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">ID: {order.id}</span>
                  <span className="text-xs text-gray-400">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString("id-ID")
                      : "-"}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    statusColors[order.status] || "text-gray-500"
                  }`}
                >
                  {order.status === "completed"
                    ? "Selesai"
                    : order.status === "cancelled"
                    ? "Dibatalkan"
                    : "Kadaluarsa"}
                </span>
              </div>

              {/* Item list */}
              <div className="space-y-1 mb-2">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.nama} x{item.cartQuantity}
                    </span>
                    <span>
                      {formatCurrency(item.harga * item.cartQuantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total + action */}
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-gray-800">
                  Total: {formatCurrency(order.total)}
                </span>
                <button
                  onClick={() => navigate(`/user/orders/${order.id}`)}
                  className="px-3 py-1 text-sm !bg-teal-500 !text-white rounded hover:!bg-teal-600"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
