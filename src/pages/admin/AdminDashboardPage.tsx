// src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { Card, CardContent } from "../../components/ui/card";
import { Alert } from "../../components/ui/alert";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLLECTIONS = [
  "ATK",
  "Banner",
  "Brosur-Flyer",
  "Copy-and-Print",
  "Name-Card-Id",
  "Packaging",
  "Photos",
  "Sticker-Logo",
  "Undangan",
  "Calendar",
  "Books-Agenda",
];

type Order = { id: string; total: number; status: string; createdAt?: any };
type Product = { id: string; status: "active" | "inactive" };
type Promotion = {
  id: string;
  title: string;
  discountPercent: number;
  status: string;
};
type User = { id: string; role: string };
type Review = { id: string; rating: number; comment: string };
type Settings = { maintenanceMode: boolean };

function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);

      // group omzet per bulan
      const grouped: Record<string, number> = {};
      data
        .filter((o) => o.status === "completed")
        .forEach((o) => {
          const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
          const bulan = date.toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          });
          grouped[bulan] = (grouped[bulan] || 0) + (o.total || 0);
        });
      setChartData(
        Object.entries(grouped).map(([bulan, total]) => ({ bulan, total }))
      );
    });

    // Products (loop semua kategori sekali fetch)
    const loadProducts = async () => {
      let all: Product[] = [];
      for (const col of COLLECTIONS) {
        const snap = await getDocs(collection(db, col));
        const mapped = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            status: data.status ?? "active",
          } as Product;
        });
        all = [...all, ...mapped];
      }
      setProducts(all);
    };
    loadProducts();

    // Promos
    const unsubPromos = onSnapshot(
      query(collection(db, "Promos"), where("status", "==", "active")),
      (snap) => {
        setPromos(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Promotion[]
        );
      }
    );

    // Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as User[]);
    });

    // Reviews
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[]);
    });

    // Settings
    const unsubSettings = onSnapshot(collection(db, "settings"), (snap) => {
      if (!snap.empty) {
        setSettings(snap.docs[0].data() as Settings);
      }
    });

    // ✅ Cleanup semua listener
    return () => {
      unsubOrders();
      unsubPromos();
      unsubUsers();
      unsubReviews();
      unsubSettings();
    };
  }, []);

  const calcNetProfit = (orders: Order[], biaya: number = 0.3) => {
    const total = orders
      .filter((o) => o.status === "completed") // ✅ hanya completed
      .reduce((sum, o) => sum + o.total, 0);
    return Math.round(total * (1 - biaya));
  };

  // Statistik
  // 💰 Hanya hitung omzet dari order yang sudah completed
  const totalOmzet = orders
    .filter((o) => o.status === "completed")
    .reduce((sum: number, o: Order) => sum + (o.total || 0), 0);

  const activeProducts = products.filter((p) => p.status === "active").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "inactive"
  ).length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold !text-gray-800">📊 Dashboard Admin</h1>

      {settings?.maintenanceMode && (
        <Alert className="!bg-yellow-100 !text-yellow-800 font-medium">
          ⚠️ Aplikasi sedang dalam mode maintenance!
        </Alert>
      )}

      {/* Statistik utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r !from-cyan-500 !to-blue-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Jumlah Order</h2>
            <p className="mt-2 text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="!bg-gradient-to-r !from-emerald-500 !to-green-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Omzet Penjualan</h2>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(totalOmzet)}
            </p>
          </CardContent>
        </Card>
        <Card className="!bg-gradient-to-r !from-amber-500 !to-orange-500 !text-white shadow-lg !shadow-orange-500/40">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Laba Bersih</h2>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(calcNetProfit(orders))}
            </p>
            <p className="text-xs opacity-80 mt-1">Setelah potong biaya 30%</p>
          </CardContent>
        </Card>
        <Card className="!bg-gradient-to-r !from-pink-500 !to-rose-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Produk</h2>
            <p className="mt-2 text-base font-semibold">
              ✅ {activeProducts} aktif
              <br />❌ {inactiveProducts} nonaktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistik tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="!bg-gradient-to-r !from-indigo-500 !to-purple-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Total User</h2>
            <p className="mt-2 text-xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="!bg-gradient-to-r !from-teal-500 !to-cyan-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Total Review</h2>
            <p className="mt-2 text-xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card className="!bg-gradient-to-r !from-fuchsia-500 !to-pink-500 !text-white">
          <CardContent className="p-4">
            <h2 className="text-sm opacity-80">Promo Aktif</h2>
            <p className="mt-2 text-xl font-bold">{promos.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik omzet */}
      <div className="p-6 !bg-white shadow rounded-lg">
        <h2 className="text-lg font-semibold !text-gray-800 mb-2">
          Grafik Omzet per Bulan
        </h2>
        {chartData.length === 0 ? (
          <p className="!text-gray-500">Belum ada data penjualan.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                <XAxis dataKey="bulan" stroke="#374151" />
                <YAxis
                  tickFormatter={(value: number) => {
                    if (value >= 1_000_000_000)
                      return `${(value / 1_000_000_000).toFixed(1)}M`;
                    if (value >= 1_000_000)
                      return `${(value / 1_000_000).toFixed(1)}Jt`;
                    if (value >= 1_000)
                      return `${(value / 1_000).toFixed(0)}Rb`;
                    return value.toString();
                  }}
                  stroke="#374151"
                />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#14b8a6" }}
                  activeDot={{ r: 6, fill: "#0d9488" }}
                  fill="url(#colorOmzet)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
