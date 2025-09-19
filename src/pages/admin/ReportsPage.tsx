// src/pages/admin/ReportsPage.tsx
import { useEffect, useState } from "react";
import { db } from "../../libs/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt?: any;
};

const ReportsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // 🔥 Ambil order yg completed aja
    const q = query(
      collection(db, "orders"),
      where("status", "==", "completed")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);

      // group per bulan
      const grouped: Record<string, number> = {};
      data.forEach((o) => {
        const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
        const bulan = date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
        grouped[bulan] = (grouped[bulan] || 0) + o.total;
      });

      setChartData(
        Object.entries(grouped).map(([bulan, total]) => ({ bulan, total }))
      );
    });

    return () => unsub();
  }, []);

  const handleExport = async () => {
    try {
      await addDoc(collection(db, "reports"), {
        createdAt: serverTimestamp(),
        total: orders.reduce((sum, o) => sum + o.total, 0),
        orders: orders.length,
        chart: chartData,
      });
      alert("✅ Report berhasil disimpan ke Firestore!");
    } catch (err) {
      console.error("Error export report:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">📊 Laporan Penjualan</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded !bg-teal-600 !text-white hover:!bg-teal-700 w-full sm:w-auto"
        >
          Export Report
        </button>
      </div>

      <p className="text-gray-600">
        Pantau omzet dan laba dari pesanan yang sudah selesai.
      </p>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg shadow !text-white !bg-gradient-to-r !from-blue-500 !to-blue-700">
          <p className="text-blue-100 font-medium">Total Order</p>
          <p className="text-2xl font-extrabold">{orders.length}</p>
        </div>

        <div className="p-4 rounded-lg shadow !text-white !bg-gradient-to-r !from-green-500 !to-emerald-700">
          <p className="!text-green-100 font-medium">Total Omzet</p>
          <p className="text-2xl font-extrabold">
            {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
          </p>
        </div>

        {/* ✅ Card Laba Bersih */}
        <div className="p-4 rounded-lg shadow !text-white !bg-gradient-to-r !from-purple-500 !to-indigo-700">
          <p className="!text-purple-100 font-medium">Laba Bersih</p>
          <p className="text-2xl font-extrabold">
            {formatCurrency(
              Math.round(orders.reduce((sum, o) => sum + o.total, 0) * 0.7)
            )}
          </p>
          <p className="text-xs !text-purple-200 mt-1">
            Setelah potong biaya 30%
          </p>
        </div>
      </div>

      {/* Grafik */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          Grafik Penjualan per Bulan
        </h2>
        {chartData.length === 0 ? (
          <p className="text-gray-500">Belum ada data penjualan.</p>
        ) : (
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="bulan" />
                <YAxis
                  tickFormatter={(value: number) => {
                    if (value >= 1_000_000_000)
                      return `${(value / 1_000_000_000).toFixed(1)}M`;
                    if (value >= 1_000_000)
                      return `${(value / 1_000_000).toFixed(1)}Jt`;
                    if (value >= 1_000)
                      return `${(value / 1_000).toFixed(0)}Rb`;
                    return value.toString(); // ✅ biar selalu string
                  }}
                />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#14b8a6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
