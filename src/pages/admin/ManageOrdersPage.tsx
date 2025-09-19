// src/pages/admin/ManageOrdersPage.tsx
import { useEffect, useState } from "react";
import { db } from "../../libs/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import { useForm } from "react-hook-form";
import { formatCurrency } from "../../utils/formatCurrency";
import type { Order, OrderStatus, OrderItem } from "../../types/order";
import { useAuth } from "../../hooks/useAuth";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import { Trash2 } from "lucide-react";

// ✅ ubah definisi type OrderFormValues
type OrderFormValues = {
  userId?: string;
  items: string[];
  [key: `qty_${string}`]: string | number | undefined;
  promoId?: string;  // 👈 ganti dari promoSlug ke promoId
  orderDate?: string;
  paymentCategory?: string;
  paymentMethod?: string;
  paymentProof?: string;
  status?: OrderStatus;
};

const gradientColors: Record<OrderStatus, string> = {
  draft: "!bg-gradient-to-r !from-orange-400 !to-orange-600 !text-white",
  pending: "!bg-gradient-to-r !from-yellow-400 !to-yellow-600 !text-white",
  waiting_verification:
    "!bg-gradient-to-r !from-blue-400 !to-blue-600 !text-white",
  confirmed: "!bg-gradient-to-r !from-green-400 !to-green-600 !text-white",
  processing: "!bg-gradient-to-r !from-indigo-400 !to-indigo-600 !text-white",
  shipped: "!bg-gradient-to-r !from-purple-400 !to-purple-600 !text-white",
  delivered: "!bg-gradient-to-r !from-teal-400 !to-teal-600 !text-white",
  completed: "!bg-gradient-to-r !from-gray-400 !to-gray-600 !text-white",
  rejected: "!bg-gradient-to-r !from-red-400 !to-red-600 !text-white",
  expired: "!bg-gradient-to-r !from-orange-400 !to-amber-700 !text-white",
};

// 🏦 Data rekening pribadi
const rekeningPribadi: Record<
  string,
  { bank: string; norek: string; nama: string }
> = {
  BRI: { bank: "BRI", norek: "1234567890", nama: "John Doe" },
  BNI: { bank: "BNI", norek: "9876543210", nama: "Anatasya" },
  BCA: { bank: "BCA", norek: "1122334455", nama: "Claura" },
  Hana: { bank: "Hana", norek: "48412345678901234", nama: "Indy" },
  OCBC: { bank: "OCBC", norek: "028327106765", nama: "Ella" },
  Mandiri: { bank: "Mandiri", norek: "5566778899", nama: "Angel" },
  GoPay: { bank: "GoPay", norek: "081234567890", nama: "John Doe" },
  OVO: { bank: "OVO", norek: "081987654321", nama: "Anatasya" },
  DANA: { bank: "DANA", norek: "085123456789", nama: "Claura" },
  ShopeePay: { bank: "ShopeePay", norek: "089876543210", nama: "Angel" },
};

const logoSrcMap: Record<string, string> = {
  BRI: "/images/payment/bri.svg",
  BNI: "/images/payment/bni.svg",
  BCA: "/images/payment/bca.svg",
  Hana: "/images/payment/hana.svg",
  OCBC: "/images/payment/ocbc.svg",
  Mandiri: "/images/payment/mandiri.svg",
  GoPay: "/images/payment/gopay.svg",
  OVO: "/images/payment/ovo.svg",
  DANA: "/images/payment/dana.svg",
  ShopeePay: "/images/payment/shopeepay.svg",
};
// ✅ Utility bikin custom OrderId
function generateCustomOrderId(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `ORD-${dd}-${mm}-${yyyy}-${hh}${min}${ss}`;
}

export const createOrder = async (orderData: any, createdBy: string) => {
  try {
    const orderId = generateCustomOrderId();

    // gunakan serverTimestamp untuk createdAt/updatedAt
    const now = serverTimestamp();

    // simpan orderDate sebagai ISO string agar konsisten (front-end mudah render)
    const orderDateIso =
      orderData.orderDate && typeof orderData.orderDate === "string"
        ? orderData.orderDate
        : new Date().toISOString().split("T")[0];

    // 1) Simpan dokumen baru dulu tanpa history (history kosong)
    await setDoc(doc(db, "orders", orderId), {
      ...orderData,
      orderId,
      status: orderData.status || "draft",
      createdAt: now,
      updatedAt: now,
      orderDate: orderDateIso,
      history: [],
    });

    // 2) Tambahin history awal via updateOrderStatus agar format sama
    await updateOrderStatus(
      orderId,
      orderData.status || "draft",
      createdBy,
      orderData.paymentProof || undefined
    );

    return { orderId };
  } catch (error) {
    console.error("❌ Error createOrder:", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  updatedBy: string,
  buktiUrl?: string,
  extraFields?: Record<string, any>
) => {
  const ref = doc(db, "orders", orderId);

  // ⛔️ Jangan pakai serverTimestamp di arrayUnion
  const historyEntry: any = {
    orderId,
    status,
    updatedBy,
    // pakai client date untuk arrayUnion
    timestamp: new Date(),
    ...(buktiUrl ? { buktiUrl } : {}),
    ...(extraFields || {}),
  };

  // Update dokumen utama
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(), // ✅ boleh di root
    history: arrayUnion(historyEntry), // ✅ sekarang aman
    ...(buktiUrl ? { buktiUrl } : {}),
    ...(extraFields || {}),
  });

  // Simpan juga ke global orderHistory → pakai serverTimestamp di sini
  await addDoc(collection(db, "orderHistory"), {
    orderId,
    status,
    updatedBy,
    ...(buktiUrl ? { buktiUrl } : {}),
    ...(extraFields || {}),
    timestamp: serverTimestamp(), // ✅ biar konsisten di laporan
  });
};

export const deleteOrder = async (orderId: string, deletedBy: string) => {
  const ref = doc(db, "orders", orderId);

  // entry history standar
  const historyEntry = {
    orderId,
    status: "deleted" as OrderStatus,
    updatedBy: deletedBy,
    timestamp: serverTimestamp(),
    note: "Order dihapus oleh admin",
  };

  // simpan ke koleksi orderHistory
  await addDoc(collection(db, "orderHistory"), {
    ...historyEntry,
  });

  // hapus dokumen utama
  await deleteDoc(ref);
};


const ManageOrdersPage = () => {
  const { user } = useAuth();
  // modal zoom state
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  // dialog confirm state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<
    null | (() => Promise<void>)
  >(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // dropdown export
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapOrderId = (id: string) => id.replace(/-/g, "-\u200B");

  // modal create order
  const [createOpen, setCreateOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
    nama?: string;
  } | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProduk, setSearchProduk] = useState("");
  const [promos, setPromos] = useState<any[]>([]);
  const { register, handleSubmit, setValue, watch, reset, unregister } =
    useForm<OrderFormValues>({
      defaultValues: {
        promoId: "",
        userId: "",
        orderDate: "",
        items: [],
        paymentProof: "",
        paymentCategory: "",
        paymentMethod: "",
      },
    });

  // setelah destructuring useForm(...)
  const paymentMethodKey =
    (watch("paymentMethod") as keyof typeof rekeningPribadi) || undefined;

  const rekening = paymentMethodKey
    ? rekeningPribadi[paymentMethodKey]
    : undefined;
  const logoSrc = paymentMethodKey ? logoSrcMap[paymentMethodKey] : undefined;

  // history order
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyOrder, setHistoryOrder] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Listen orders realtime
    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const data: Order[] = snap.docs.map((docSnap) => {
        const d = docSnap.data() as Order;
        return {
          ...d,
          orderId: d.orderId || docSnap.id,
          paymentProof: d.paymentProof || d.buktiUrl || undefined, // bukti transfer
          receivedPhotoUrl: d.receivedPhotoUrl || undefined, // 🆕 bukti terima user
          history: (d.history || []).map((h: any) => ({
            ...h,
            buktiUrl: h.buktiUrl || h.photoUrl || h.proof || "", // normalize
          })),
        };
      });

      setOrders(data);
      setLoading(false);
    });

    // 🔥 Listen global orderHistory
    const qHistory = query(
      collection(db, "orderHistory"),
      orderBy("timestamp", "desc")
    );
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // cleanup
    return () => {
      unsubOrders();
      unsubHistory();
    };
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    const loadProducts = async () => {
      const collections = [
        "ATK",
        "Banner",
        "Name-Card-Id",
        "Brosur-Flyer",
        "Coppy-and-Print",
        "Packaging",
        "Photos",
        "Sticker-Logo",
        "Undangan",
      ];

      // Ambil semua paralel
      const snaps = await Promise.all(
        collections.map((col) => getDocs(collection(db, col)))
      );

      // Gabung semua produk + kasih kategori
      const allProducts = snaps.flatMap((snap, i) =>
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          category: collections[i], // biar tau asalnya
        }))
      );

      setProducts(allProducts);
    };

    loadUsers();
    loadProducts();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Promos"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPromos(data);
    });
    return () => unsub();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const lower = searchTerm.toLowerCase();

    return (
      order.orderId?.toLowerCase().includes(lower) || // cari by ID
      order.status?.toLowerCase().includes(lower) || // cari by status
      order.items?.some(
        (item) => item.nama?.toLowerCase().includes(lower) // cari by nama produk
      )
    );
  });


 const onCreateOrder = async (data: any) => {
   try {
     // mapping produk
     const selectedItems = (data.items || [])
       .map((id: string) => {
         const product = products.find((p) => p.id === id);
         if (!product) return null;

         const qty = parseInt(data[`qty_${id}`] || "1", 10);

         return {
           productId: id,
           nama: product.nama,
           harga: product.harga,
           cartQuantity: qty,
           subtotal: product.harga * qty,
         };
       })
       .filter(Boolean);

     const total = (selectedItems as OrderItem[]).reduce(
       (acc, item) => acc + item.subtotal,
       0
     );

     const orderPayload = {
       userId: data.userId,
       orderDate: data.orderDate || new Date().toISOString().split("T")[0],
       items: selectedItems,
       total,
       paymentCategory: data.paymentCategory,
       paymentMethod: data.paymentMethod || "",
       paymentProof: data.paymentProof || "",
       status: data.status || "draft", // 👈 default aman
     };

     // ✅ createOrder otomatis tambah history awal via updateOrderStatus
     await createOrder(orderPayload, user?.email || "admin");

     reset();
     setCreateOpen(false);
   } catch (err) {
     console.error("❌ Error create order:", err);
   }
 };

  // 👉 Upload bukti bayar ke imgbb
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=b8e7c3098b5d082ffab864e87e12d256",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success) {
        const url = data.data.url;
        // simpan ke field react-hook-form
        setValue("paymentProof", url, { shouldValidate: true });
      } else {
        console.error("Upload gagal:", data);
      }
    } catch (err) {
      console.error("Error upload bukti:", err);
    }
  };

  const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },

    header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    logo: { width: 60, height: 60 },
    title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "bold" },
    address: { textAlign: "center", marginBottom: 20, fontSize: 9 },
    meta: { marginBottom: 15 },

    // ✅ table pakai flex column
    table: {
      flexDirection: "column",
      width: "100%",
      borderWidth: 1,
      borderColor: "#000",
    },
    row: { flexDirection: "row" },

    cellHeader: {
      flex: 1,
      backgroundColor: "#3366cc",
      color: "#fff",
      padding: 4,
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 9,
      fontWeight: "bold",
      textAlign: "center",
    },
    cell: {
      flex: 1,
      padding: 4,
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 9,
      textAlign: "center",
    },

    summary: { marginTop: 10, marginBottom: 20 },
    footer: { marginTop: 10, fontSize: 10, textAlign: "center" },
  });

  const ReportPDF = ({ orders }: { orders: Order[] }) => {
    const subtotal = orders.reduce((sum, o) => sum + o.total, 0);
    const totalPotongan = orders.reduce(
      (sum, o) => sum + (o.promo?.discountValue || 0),
      0
    );

    const tanggal = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image src="/images/logo-pdf-excel.png" style={styles.logo} />
            <Text style={styles.title}>AM-Printing</Text>
          </View>
          <Text style={styles.address}>
            Jl. Kapt Hanafiah Karanganyar Depan gate Perum BSK Kp.Rawabadak
            Subang, Jawabarat
          </Text>

          <View style={styles.meta}>
            <Text>Nama PIC : AMD-Printing (Admin)</Text>
            <Text>Hari/Tgl : {tanggal}</Text>
            <Text>Laporan : Pesanan/Penjualan Keseluruhan Barang</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.row}>
              <Text style={[styles.cellHeader, { width: 80 }]}>Id Pesanan</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Produk</Text>
              <Text style={[styles.cellHeader, { width: 40 }]}>Qty</Text>
              <Text style={[styles.cellHeader, { width: 80 }]}>
                Metode Bayar
              </Text>
              <Text style={[styles.cellHeader, { width: 60 }]}>Bukti</Text>
              <Text style={[styles.cellHeader, { width: 70 }]}>Status</Text>
              <Text style={[styles.cellHeader, { width: 60 }]}>Discount</Text>
              <Text style={[styles.cellHeader, { width: 80 }]}>Total</Text>
            </View>

            {/* Data Orders */}
            {orders.map((o) =>
              o.items.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text
                    style={[
                      styles.cell,
                      { width: 80, flexWrap: "wrap", fontSize: 7 },
                    ]}
                  >
                    {i === 0 ? wrapOrderId(o.orderId) : ""}
                  </Text>
                  <Text style={[styles.cell, { width: 150 }]}>{item.nama}</Text>
                  <Text style={[styles.cell, { width: 40 }]}>
                    {item.cartQuantity}
                  </Text>
                  <Text style={[styles.cell, { width: 80 }]}>
                    {i === 0 ? o.paymentMethod : ""}
                  </Text>
                  <Text style={[styles.cell, { width: 60 }]}>
                    {i === 0 && o.paymentProof ? (
                      <Link src={o.paymentProof}>Lihat Bukti</Link>
                    ) : (
                      ""
                    )}
                  </Text>
                  <Text style={[styles.cell, { width: 70 }]}>
                    {i === 0 ? o.status : ""}
                  </Text>
                  <Text style={[styles.cell, { width: 60 }]}>
                    {i === 0 ? o.promo?.discount || "-" : ""}
                  </Text>
                  <Text style={[styles.cell, { width: 80 }]}>
                    {i === 0 ? o.total.toLocaleString("id-ID") : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View
            style={{ marginTop: 20, alignItems: "flex-end", width: "100%" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Sub Total : {formatCurrency(subtotal)}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Potongan : {formatCurrency(totalPotongan)}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "bold" }}>
              Total Penjualan : {formatCurrency(subtotal - totalPotongan)}
            </Text>
          </View>

          <View
            style={{ marginTop: 40, alignItems: "flex-end", width: "100%" }}
          >
            <Text style={{ fontSize: 10 }}>Demikian Laporan ini Kami Buat</Text>
            <Text style={{ fontSize: 10, marginTop: 20 }}>Hormat Kami,</Text>
            <Text style={{ marginTop: 40 }}>___________________</Text>
            <Text>Nama PIC</Text>
          </View>
        </Page>
      </Document>
    );
  };

  // ✅ Loading hanya sekali
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 !border-teal-600 !border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  // ✅ Utility buat status
  const countByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  // ✅ Dialog confirm action (cukup sekali)
  const confirmAction = (message: string, action: () => Promise<void>) => {
    setDialogMessage(message);
    setDialogAction(() => action);
    setDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">📦 Kelola Orders</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="px-3 py-1 rounded !bg-green-600 !text-white"
          >
            + Buat Order Baru
          </button>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>⋮</button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 !bg-white shadow rounded text-sm">
                <PDFDownloadLink
                  document={<ReportPDF orders={orders} />}
                  fileName={`laporan-orders-${new Date()
                    .toLocaleDateString("id-ID")
                    .replace(/\//g, "-")}.pdf`}
                  className="block w-full px-4 py-2 text-left"
                >
                  {({ loading }) => (loading ? "Loading PDF..." : "Export PDF")}
                </PDFDownloadLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Count */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {/* Semua status */}
        {(Object.keys(gradientColors) as OrderStatus[]).map((s) => (
          <div
            key={s}
            className={`p-3 rounded-xl shadow-md flex flex-col items-center w-full text-center ${gradientColors[s]}`}
          >
            <p className="capitalize font-semibold">{s}</p>
            <p className="text-xl">{countByStatus(s)}</p>
          </div>
        ))}
      </div>

      {/* 🔍 Search Bar */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="🔍 Cari order (ID, produk, status)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
      </div>
    {/* Table utama */}
      <div className="hidden md:block overflow-x-auto !bg-white shadow rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="!bg-cyan-800 text-left">
            <tr className="!text-gray-100">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Metode Bayar</th>
              <th className="px-4 py-3">Bukti Pembayaran</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
          {filteredOrders.map((order) => (
              <tr
                key={order.orderId}
                className="border-t hover:!bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-mono text-xs">{order.orderId}</td>
                <td className="px-4 py-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="!text-gray-700">
                      {item.nama}{" "}
                      <span className="!text-gray-500">
                        x{item.cartQuantity}
                      </span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3">{order.paymentMethod || "-"}</td>
                <td className="px-4 py-3">
                  {order.paymentProof ? (
                    <img
                      src={order.paymentProof}
                      alt="Bukti bayar"
                      className="w-14 h-14 object-cover rounded cursor-zoom-in border"
                      onClick={() => setZoomImage(order.paymentProof || "")}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      gradientColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex flex-col sm:flex-row gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus; // capture sekarang
                      confirmAction(
                        `Yakin ubah status pesanan ${order.orderId} ke ${newStatus}?`,
                        async () => {
                          try {
                            await updateOrderStatus(
                              order.orderId!,
                              newStatus,
                              user?.email || "admin"
                            );
                          } catch (err: any) {
                            alert("Gagal mengubah status: " + (err?.message || err));
                          }
                        }
                      );
                    }}
                    className="border rounded p-1 text-sm"
                  >
                    {(Object.keys(gradientColors) as OrderStatus[]).map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      )
                    )}
                  </select>
                  {/* ✅ Tombol History */}
                  <button
                    onClick={() => {
                      setHistoryOrder(order.history || []);
                      setHistoryOpen(true);
                    }}
                    className="px-2 py-1 rounded !bg-purple-600 !text-white text-xs hover:!bg-purple-700"
                  >
                    History
                  </button>
                  {/* 🗑️ Tombol Hapus */}
                  <button
                    onClick={async () => {
                      if (confirm(`Yakin hapus order ${order.orderId}?`)) {
                        const ref = doc(db, "orders", order.orderId!);

                        // 1️⃣ Simpan history "deleted" ke koleksi orderHistory
                        await addDoc(collection(db, "orderHistory"), {
                          orderId: order.orderId,
                          status: "deleted",
                          updatedBy: user?.email || "admin",
                          timestamp: serverTimestamp(),
                        });

                        // 2️⃣ Hapus dokumen aslinya
                        await deleteDoc(ref);

                        // 3️⃣ Update UI
                        setOrders((prev) =>
                          prev.filter((o) => o.orderId !== order.orderId)
                        );
                      }
                    }}
                    className="px-3 py-1 rounded !bg-red-600 !text-white text-sm hover:!bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card List */}
      <div className="lg:hidden space-y-4 mt-4">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            {/* Order ID */}
            <p className="font-mono text-xs text-gray-500 mb-2">
              ID: {order.orderId}
            </p>

            {/* Produk */}
            <div className="mb-2">
              <p className="font-semibold text-sm text-gray-800">Produk:</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.nama}{" "}
                    <span className="text-gray-500">x{item.cartQuantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metode Pembayaran */}
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Metode Bayar:</span>{" "}
              {order.paymentMethod || "-"}
            </p>

            {/* Bukti Pembayaran */}
            <div className="mb-2">
              <p className="font-semibold text-sm text-gray-800 mb-1">
                Bukti Pembayaran:
              </p>
              {order.paymentProof ? (
                <img
                  src={order.paymentProof}
                  alt="Bukti bayar"
                  className="w-20 h-20 object-cover rounded cursor-zoom-in border"
                  onClick={() => setZoomImage(order.paymentProof || "")}
                />
              ) : (
                <p className="text-gray-500 text-sm">-</p>
              )}
            </div>

            {/* Total */}
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Total:</span>{" "}
              {formatCurrency(order.total)}
            </p>

            {/* Status */}
            <p className="text-sm mb-2">
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  gradientColors[order.status]
                }`}
              >
                {order.status}
              </span>
            </p>

            {/* Aksi */}
            <div className="flex flex-col gap-2">
              {/* Dropdown status */}
              // Mobile select (ganti handler lama)
              <select
                value={order.status}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  confirmAction(
                    `Yakin ubah status pesanan ${order.orderId} ke ${newStatus}?`,
                    async () => {
                      try {
                        await updateOrderStatus(
                          order.orderId!,
                          newStatus,
                          user?.email || "admin"
                        );
                      } catch (err: any) {
                        alert(
                          "Gagal mengubah status: " + (err?.message || err)
                        );
                      }
                    }
                  );
                }}
                className="border rounded p-2 text-sm"
              >
                {(Object.keys(gradientColors) as OrderStatus[]).map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
              {/* Tombol History */}
              <button
                onClick={() => {
                  setHistoryOrder(order.history || []);
                  setHistoryOpen(true);
                }}
                className="px-3 py-1 rounded !bg-purple-600 !text-white text-sm hover:!bg-purple-700"
              >
                History
              </button>
              {/* 🗑️ Tombol Hapus */}
              <button
                onClick={async () => {
                  if (confirm(`Yakin hapus order ${order.orderId}?`)) {
                    const ref = doc(db, "orders", order.orderId!);

                    // 1️⃣ Simpan history "deleted" ke koleksi orderHistory
                    await addDoc(collection(db, "orderHistory"), {
                      orderId: order.orderId,
                      status: "deleted",
                      updatedBy: user?.email || "admin",
                      timestamp: serverTimestamp(),
                    });

                    // 2️⃣ Hapus dokumen aslinya
                    await deleteDoc(ref);

                    // 3️⃣ Update UI
                    setOrders((prev) =>
                      prev.filter((o) => o.orderId !== order.orderId)
                    );
                  }
                }}
                className="px-3 py-1 rounded !bg-red-600 !text-white text-sm hover:!bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {historyOpen && (
        <div className="fixed inset-0 flex items-center justify-center !bg-black/50 z-50 p-3 sm:p-6">
          <div className="!bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4">History Order</h2>
            <ul className="space-y-2 text-sm">
              {historyOrder.map((h, idx) => (
                <li key={idx} className="border-b pb-2">
                  <span className="font-mono text-xs">
                    {new Date(
                      h.timestamp?.toDate?.() || h.timestamp
                    ).toLocaleString()}
                  </span>{" "}
                  - <strong>{h.status}</strong> oleh {h.updatedBy}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-3 py-1 rounded !bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Status */}
      <div className="hidden md:block mt-10">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>🕒</span> History Status
        </h2>

        <div className="overflow-x-auto !bg-white shadow rounded-xl">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="!bg-cyan-800 text-left !text-gray-100">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Bukti Bayar</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status Utama</th>
                <th className="px-4 py-3 font-medium">Status Order</th>
                <th className="px-4 py-3 font-medium">Diupdate Oleh</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
                <th className="px-4 py-3 font-medium">Bukti Terima</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => {
                // 🔗 cari data order utamanya biar bisa tarik total & paymentProof
                const order = orders.find((o) => o.orderId === h.orderId);

                // helper format waktu
                const formatTimestamp = (ts: any) => {
                  if (!ts) return "-";
                  let date;
                  if (ts?.seconds) date = new Date(ts.seconds * 1000);
                  else if (typeof ts === "string" || typeof ts === "number")
                    date = new Date(ts);
                  else if (ts instanceof Date) date = ts;
                  else return "-";
                  return date.toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                };

                return (
                  <tr
                    key={h.id || idx}
                    className="border-t hover:!bg-gray-50 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-2 font-mono text-xs !text-gray-600">
                      {h.orderId}
                    </td>

                    {/* Bukti Bayar */}
                    <td className="px-4 py-2">
                      {order?.paymentProof ? (
                        <img
                          src={order.paymentProof}
                          alt="Bukti Bayar"
                          className="w-14 h-14 object-cover rounded cursor-zoom-in border"
                          onClick={() => setZoomImage(order.paymentProof!)}
                        />
                      ) : (
                        <span className="!text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-2 font-medium whitespace-nowrap">
                      {order ? formatCurrency(order.total) : "-"}
                    </td>

                    {/* Status Utama */}
                    <td className="px-4 py-2">
                      {order ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            gradientColors[order.status as OrderStatus] ||
                            "bg-gray-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-white">
                          deleted
                        </span>
                      )}
                    </td>

                    {/* Status Order (dari history) */}
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gradientColors[h.status as OrderStatus] ||
                          "bg-gray-300"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>

                    {/* Updated By */}
                    <td className="px-4 py-2 !text-gray-700">{h.updatedBy}</td>

                    {/* Timestamp */}
                    <td className="px-4 py-2 !text-gray-600">
                      {formatTimestamp(h.timestamp)}
                    </td>

                    {/* Bukti Terima */}
                    <td className="px-4 py-2">
                      {order?.receivedPhotoUrl ? (
                        <img
                          src={order.receivedPhotoUrl}
                          alt="Bukti Terima"
                          className="w-14 h-14 object-cover rounded cursor-zoom-in border"
                          onClick={() => setZoomImage(order.receivedPhotoUrl!)}
                        />
                      ) : (
                        <span className="!text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Mobile Card List – History Status */}
      <div className="md:hidden mt-6 space-y-3">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>🕒</span> History Status
        </h2>

        {history.map((h, idx) => {
          const order = orders.find((o) => o.orderId === h.orderId);

          const formatTimestamp = (ts: any) => {
            if (!ts) return "-";
            let date;
            if (ts?.seconds) date = new Date(ts.seconds * 1000);
            else if (typeof ts === "string" || typeof ts === "number")
              date = new Date(ts);
            else if (ts instanceof Date) date = ts;
            else return "-";
            return date.toLocaleString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          };

          return (
            <div
              key={h.id || idx}
              className="border rounded-lg p-3 bg-white shadow-sm"
            >
              {/* Order ID */}
              <p className="font-mono text-xs !text-gray-600 mb-2">
                {h.orderId}
              </p>

              {/* Status utama */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">Status Utama:</span>
                {order ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      gradientColors[order.status as OrderStatus] ||
                      "bg-gray-300"
                    }`}
                  >
                    {order.status}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-white">
                    deleted
                  </span>
                )}
              </div>

              {/* Status history */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Status Order:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gradientColors[h.status as OrderStatus] || "bg-gray-300"
                  }`}
                >
                  {h.status}
                </span>
              </div>

              {/* Diupdate Oleh */}
              <p className="text-sm !text-gray-700 mb-1">
                <span className="font-medium">Diupdate Oleh:</span>{" "}
                {h.updatedBy}
              </p>

              {/* Waktu */}
              <p className="text-xs !text-gray-600 mb-2">
                <span className="font-medium">Waktu:</span>{" "}
                {formatTimestamp(h.timestamp)}
              </p>

              {/* Bukti Bayar */}
              <div className="mb-2">
                <span className="font-medium text-sm">Bukti Bayar:</span>{" "}
                {order?.paymentProof ? (
                  <img
                    src={order.paymentProof}
                    alt="Bukti Bayar"
                    className="w-16 h-16 mt-1 object-cover rounded border cursor-zoom-in"
                    onClick={() => setZoomImage(order.paymentProof!)}
                  />
                ) : (
                  <span className="!text-gray-400 text-xs">-</span>
                )}
              </div>

              {/* Bukti Terima */}
              <div>
                <span className="font-medium text-sm">Bukti Terima:</span>{" "}
                {order?.receivedPhotoUrl ? (
                  <img
                    src={order.receivedPhotoUrl}
                    alt="Bukti Terima"
                    className="w-16 h-16 mt-1 object-cover rounded border cursor-zoom-in"
                    onClick={() => setZoomImage(order.receivedPhotoUrl!)}
                  />
                ) : (
                  <span className="!text-gray-400 text-xs">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create Order */}
      {createOpen && (
        <div className="fixed inset-0 flex items-center justify-center !bg-gray-500/40 backdrop-blur-sm z-50 p-4">
          <div className="!bg-white p-6 rounded-lg w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-6">📝 Buat Order Baru</h2>
            <form onSubmit={handleSubmit(onCreateOrder)} className="space-y-5">
              {/* User Search + Select */}
              <div>
                <label className="block font-medium mb-1">Pilih User:</label>
                <input
                  type="text"
                  placeholder="Cari user..."
                  className="w-full border rounded p-2 mb-2"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />

                {searchUser && (
                  <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white shadow">
                    {users
                      .filter(
                        (u) =>
                          u.email
                            .toLowerCase()
                            .includes(searchUser.toLowerCase()) ||
                          (u.nama || "")
                            .toLowerCase()
                            .includes(searchUser.toLowerCase())
                      )
                      .map((u) => (
                        <div
                          key={u.id}
                          className={`p-2 rounded cursor-pointer ${
                            watch("userId") === u.id
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setValue("userId", u.id);
                            setSelectedUser(u);
                            setSearchUser("");
                          }}
                        >
                          <p className="font-medium">{u.email}</p>
                          <p className="text-sm text-gray-500">
                            {u.nama || "-"}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    ✅ {selectedUser.email} ({selectedUser.nama || "-"})
                  </div>
                )}
              </div>

              {/* Tanggal Order */}
              <div>
                <label className="block font-medium mb-1">Tanggal Order:</label>
                <input
                  type="date"
                  {...register("orderDate")}
                  className="w-full border rounded p-2"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Produk Multi Select */}
              <div>
                <label className="block font-medium mb-1">Pilih Produk:</label>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full border rounded p-2 mb-2"
                  value={searchProduk}
                  onChange={(e) => setSearchProduk(e.target.value)}
                />

                <div className="border rounded p-2 max-h-40 overflow-y-auto">
                  {products
                    .filter((p) =>
                      p.nama.toLowerCase().includes(searchProduk.toLowerCase())
                    )
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={watch("items")?.includes(p.id)}
                          onChange={(e) => {
                            const prev = watch("items") || [];
                            if (e.target.checked) {
                              setValue("items", [...prev, p.id]);
                              setValue(`qty_${p.id}`, 1, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            } else {
                              const next = prev.filter(
                                (pid: string) => pid !== p.id
                              );
                              setValue("items", next);
                              unregister(`qty_${p.id}`);
                            }
                          }}
                        />
                        <span>
                          {p.nama} - {formatCurrency(p.harga)}
                        </span>
                      </div>
                    ))}
                </div>

                {watch("items")?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {watch("items").map((id: string) => {
                      const produk = products.find((p) => p.id === id);
                      if (!produk) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 border p-2 rounded bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{produk.nama}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(produk.harga)}
                            </p>
                          </div>
                          <input
                            type="number"
                            min={1}
                            value={watch(`qty_${id}`) || 1}
                            onChange={(e) =>
                              setValue(`qty_${id}`, Number(e.target.value), {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                            className="w-20 border rounded px-2 py-1 text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "items",
                                watch("items").filter(
                                  (pid: string) => pid !== id
                                )
                              )
                            }
                            className="px-2 py-1 !text-red-600 hover:!bg-red-100 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Harga Detail */}
              <div className="space-y-1">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (watch("items") || []).reduce(
                        (total: number, id: string) => {
                          const produk = products.find((p) => p.id === id);
                          const qty = Number(watch(`qty_${id}`) || 1);
                          return total + (produk ? produk.harga * qty : 0);
                        },
                        0
                      )
                    )}
                  </span>
                </div>

                {/* Promo */}
                <div>
                  <label className="block font-medium mb-1">Pilih Promo:</label>
                  <select
                    value={watch("promoId") || ""} // 👈 ini biar controlled
                    onChange={(e) =>
                      setValue("promoId", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="">Tanpa Promo</option>
                    {promos.map((promo) => (
                      <option
                        key={promo.promoId || promo.id}
                        value={promo.promoId}
                      >
                        {promo.title} ({promo.discountPercent}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Potongan */}
                {(() => {
                  const subtotal = (watch("items") || []).reduce(
                    (total: number, id: string) => {
                      const produk = products.find((p) => p.id === id);
                      const qty = Number(watch(`qty_${id}`) || 1);
                      return total + (produk ? produk.harga * qty : 0);
                    },
                    0
                  );

                  const promo = promos.find(
                    (p) => p.promoId === watch("promoId")
                  );
                  const persen = promo?.discountPercent || 0;
                  const potongan = (subtotal * persen) / 100;

                  if (!promo || potongan === 0) return null;
                  return (
                    <div className="flex justify-between text-green-600">
                      <span>Promo ({persen}%):</span>
                      <span>-{formatCurrency(potongan)}</span>
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    {(() => {
                      const subtotal = (watch("items") || []).reduce(
                        (total: number, id: string) => {
                          const produk = products.find((p) => p.id === id);
                          const qty = Number(watch(`qty_${id}`) || 1);
                          return total + (produk ? produk.harga * qty : 0);
                        },
                        0
                      );

                      const promo = promos.find(
                        (p) => p.promoId === watch("promoId")
                      );
                      const persen = promo?.discountPercent || 0;
                      const total = subtotal - (subtotal * persen) / 100;

                      return formatCurrency(total);
                    })()}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div>
                <label className="block font-medium mb-1">
                  Metode Pembayaran:
                </label>
                <select
                  value={watch("paymentCategory") || ""}
                  onChange={(e) => setValue("paymentCategory", e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Pilih kategori...</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="cod">COD</option>
                </select>

                {/* Bank Transfer */}
                {watch("paymentCategory") === "bank_transfer" && (
                  <select
                    value={watch("paymentMethod") || ""}
                    onChange={(e) => setValue("paymentMethod", e.target.value)}
                    className="w-full border rounded p-2 mt-2"
                  >
                    <option value="">Pilih bank...</option>
                    {Object.keys(rekeningPribadi)
                      .filter((k) =>
                        [
                          "BRI",
                          "BCA",
                          "BNI",
                          "Mandiri",
                          "OCBC",
                          "Hana",
                        ].includes(k)
                      )
                      .map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                  </select>
                )}

                {/* E-Wallet */}
                {watch("paymentCategory") === "ewallet" && (
                  <select
                    value={watch("paymentMethod") || ""}
                    onChange={(e) => setValue("paymentMethod", e.target.value)}
                    className="w-full border rounded p-2 mt-2"
                  >
                    <option value="">Pilih e-wallet...</option>
                    {Object.keys(rekeningPribadi)
                      .filter((k) =>
                        ["DANA", "OVO", "GoPay", "ShopeePay"].includes(k)
                      )
                      .map((wallet) => (
                        <option key={wallet} value={wallet}>
                          {wallet}
                        </option>
                      ))}
                  </select>
                )}

                {/* Show rekening detail */}
                {paymentMethodKey && rekening && (
                  <div className="mt-3 p-3 border rounded bg-gray-50 flex items-center gap-3">
                    {logoSrc && (
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <div>
                      <p className="font-medium">{rekening.bank}</p>
                      <p className="text-sm">{rekening.norek}</p>
                      <p className="text-xs text-gray-600">{rekening.nama}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bukti Pembayaran */}
              <div>
                <label className="block font-medium mb-1">
                  Bukti Pembayaran:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProof}
                  className="w-full border p-2 rounded"
                />
                {watch("paymentProof") && (
                  <div className="mt-2">
                    <img
                      src={watch("paymentProof")}
                      alt="Bukti Pembayaran"
                      className="w-40 h-40 object-cover rounded shadow"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium mb-1">Status:</label>
                <select
                  {...register("status")}
                  className="w-full border p-2 rounded"
                >
                  {Object.entries(gradientColors).map(([status]) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setCreateOpen(false)}
                  type="button"
                  className="px-3 py-1 rounded !bg-gray-200 hover:!bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded !bg-green-600 hover:!bg-green-700 !text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Order mobile */}
      {createOpen && (
        <div className="md:hidden fixed inset-0 flex items-center justify-center !bg-gray-500/40 backdrop-blur-sm z-50 p-2 sm:p-4">
          <div
            className="
            !bg-white rounded-lg w-full 
            max-w-full sm:max-w-2xl 
            h-full sm:h-auto 
            sm:max-h-[90vh] 
            overflow-y-auto sm:overflow-auto
            flex flex-col
          "
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">
                📝 Buat Order Baru
              </h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="!text-gray-500 hover:!text-gray-700 text-2xl sm:text-xl"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onCreateOrder)}
              className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto"
            >
              {/* === User Search === */}
              <div>
                <label className="block font-medium mb-1">Pilih User:</label>
                <input
                  type="text"
                  placeholder="Cari user..."
                  className="w-full border rounded p-2 mb-2"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />

                {searchUser && (
                  <div className="border rounded p-2 max-h-40 overflow-y-auto !bg-white shadow">
                    {users
                      .filter(
                        (u) =>
                          u.email
                            .toLowerCase()
                            .includes(searchUser.toLowerCase()) ||
                          (u.nama || "")
                            .toLowerCase()
                            .includes(searchUser.toLowerCase())
                      )
                      .map((u) => (
                        <div
                          key={u.id}
                          className={`p-2 rounded cursor-pointer ${
                            watch("userId") === u.id
                              ? "!bg-blue-100"
                              : "hover:!bg-gray-100"
                          }`}
                          onClick={() => {
                            setValue("userId", u.id);
                            setSelectedUser(u);
                            setSearchUser("");
                          }}
                        >
                          <p className="font-medium">{u.email}</p>
                          <p className="text-sm !text-gray-500">
                            {u.nama || "-"}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="mt-2 p-2 border rounded !bg-gray-50 text-sm sm:text-base">
                    ✅ {selectedUser.email} ({selectedUser.nama || "-"})
                  </div>
                )}
              </div>

              {/* === Tanggal Order === */}
              <div>
                <label className="block font-medium mb-1">Tanggal Order:</label>
                <input
                  type="date"
                  {...register("orderDate")}
                  className="w-full border rounded p-2"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* === Produk Multi Select === */}
              <div>
                <label className="block font-medium mb-1">Pilih Produk:</label>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full border rounded p-2 mb-2"
                  value={searchProduk}
                  onChange={(e) => setSearchProduk(e.target.value)}
                />

                <div className="border rounded p-2 max-h-40 overflow-y-auto">
                  {products
                    .filter((p) =>
                      p.nama.toLowerCase().includes(searchProduk.toLowerCase())
                    )
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={watch("items")?.includes(p.id)}
                          onChange={(e) => {
                            const prev = watch("items") || [];
                            if (e.target.checked) {
                              setValue("items", [...prev, p.id]);
                              setValue(`qty_${p.id}`, 1, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            } else {
                              const next = prev.filter(
                                (pid: string) => pid !== p.id
                              );
                              setValue("items", next);
                              unregister(`qty_${p.id}`);
                            }
                          }}
                        />
                        <span>
                          {p.nama} - {formatCurrency(p.harga)}
                        </span>
                      </div>
                    ))}
                </div>

                {watch("items")?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {watch("items").map((id: string) => {
                      const produk = products.find((p) => p.id === id);
                      if (!produk) return null;
                      return (
                        <div
                          key={id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border p-2 rounded bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{produk.nama}</p>
                            <p className="text-sm !text-gray-500">
                              {formatCurrency(produk.harga)}
                            </p>
                          </div>
                          <input
                            type="number"
                            {...register(`qty_${id}`, { valueAsNumber: true })}
                            min={1}
                            defaultValue={1}
                            className="w-20 border rounded px-2 py-1 text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "items",
                                watch("items").filter(
                                  (pid: string) => pid !== id
                                )
                              )
                            }
                            className="px-2 py-1 !text-red-600 hover:!bg-red-100 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* === Harga Detail === */}
              <div className="space-y-2 text-sm sm:text-base">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (watch("items") || []).reduce(
                        (total: number, id: string) => {
                          const produk = products.find((p) => p.id === id);
                          const qty = Number(watch(`qty_${id}`) || 1);
                          return total + (produk ? produk.harga * qty : 0);
                        },
                        0
                      )
                    )}
                  </span>
                </div>

                {/* Promo */}
                <div>
                  <label className="block font-medium mb-1">Pilih Promo:</label>
                  <select
                    {...register("promoId")}
                    className="w-full border rounded p-2"
                    defaultValue=""
                  >
                    <option value="">Tanpa Promo</option>
                    {promos.map((promo) => (
                      <option key={promo.promoId} value={promo.promoId}>
                        {promo.title} ({promo.discountPercent}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Potongan */}
                {(() => {
                  const subtotal = (watch("items") || []).reduce(
                    (total: number, id: string) => {
                      const produk = products.find((p) => p.id === id);
                      const qty = Number(watch(`qty_${id}`) || 1);
                      return total + (produk ? produk.harga * qty : 0);
                    },
                    0
                  );

                  const promo = promos.find(
                    (p) => p.promoId === watch("promoId")
                  );
                  const persen = promo?.discountPercent || 0;
                  const potongan = (subtotal * persen) / 100;

                  if (!promo || potongan === 0) return null;

                  return (
                    <div className="flex justify-between !text-green-600">
                      <span>Promo ({promo.discountPercent}%):</span>
                      <span>-{formatCurrency(potongan)}</span>
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="flex justify-between border-t pt-1 font-semibold text-base sm:text-lg">
                  <span>Total:</span>
                  <span className="font-bold">
                    {(() => {
                      const subtotal = (watch("items") || []).reduce(
                        (total: number, id: string) => {
                          const produk = products.find((p) => p.id === id);
                          const qty = Number(watch(`qty_${id}`) || 1);
                          return total + (produk ? produk.harga * qty : 0);
                        },
                        0
                      );

                      const promo = promos.find(
                        (p) => p.promoId === watch("promoId")
                      );
                      const persen = promo?.discountPercent || 0;
                      const total = subtotal - (subtotal * persen) / 100;

                      return formatCurrency(total);
                    })()}
                  </span>
                </div>
              </div>

              {/* === Payment === */}
              <div>
                <label className="block font-medium mb-1">
                  Metode Pembayaran:
                </label>
                <select
                  value={watch("paymentCategory") || ""}
                  onChange={(e) => setValue("paymentCategory", e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Pilih kategori...</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="cod">COD</option>
                </select>

                {watch("paymentCategory") === "bank_transfer" && (
                  <select
                    value={watch("paymentMethod") || ""}
                    onChange={(e) => setValue("paymentMethod", e.target.value)}
                    className="w-full border rounded p-2 mt-2"
                  >
                    <option value="">Pilih bank...</option>
                    {["BRI", "BCA", "BNI", "Mandiri", "OCBC", "Hana"].map(
                      (bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      )
                    )}
                  </select>
                )}

                {watch("paymentCategory") === "ewallet" && (
                  <select
                    value={watch("paymentMethod") || ""}
                    onChange={(e) => setValue("paymentMethod", e.target.value)}
                    className="w-full border rounded p-2 mt-2"
                  >
                    <option value="">Pilih e-wallet...</option>
                    {["DANA", "OVO", "GoPay", "ShopeePay"].map((wallet) => (
                      <option key={wallet} value={wallet}>
                        {wallet}
                      </option>
                    ))}
                  </select>
                )}

                {/* Show rekening detail */}
                {paymentMethodKey && rekening && (
                  <div className="mt-3 p-3 border rounded bg-gray-50 flex items-center gap-3">
                    {logoSrc && (
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <div>
                      <p className="font-medium">{rekening.bank}</p>
                      <p className="text-sm">{rekening.norek}</p>
                      <p className="text-xs text-gray-600">{rekening.nama}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* === Bukti === */}
              <div>
                <label className="block font-medium mb-1">
                  Bukti Pembayaran:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProof}
                  className="w-full border p-2 rounded"
                />
                {watch("paymentProof") && (
                  <div className="mt-2">
                    <img
                      src={watch("paymentProof")}
                      alt="Bukti Pembayaran"
                      className="w-40 h-40 object-cover rounded shadow"
                    />
                  </div>
                )}
              </div>

              {/* === Status === */}
              <div>
                <label className="block font-medium mb-1">Status:</label>
                <select
                  {...register("status")}
                  className="w-full border p-2 rounded"
                >
                  {Object.entries(gradientColors).map(([status]) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* === Actions === */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
                <button
                  onClick={() => setCreateOpen(false)}
                  type="button"
                  className="px-4 py-2 rounded !bg-gray-200 hover:!bg-gray-300 w-full sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded !bg-green-600 hover:!bg-green-700 !text-white w-full sm:w-auto"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HeadlessDialog
        open={dialogOpen}
        onClose={() => {
          if (!dialogLoading) setDialogOpen(false);
        }}
        className="relative z-50"
      >
        {/* Overlay */}
        <div className="fixed inset-0 !bg-black/30" aria-hidden="true" />

        {/* Wrapper responsif */}
        <div className="fixed inset-0 flex items-center justify-center md:items-center md:justify-center p-4">
          <HeadlessDialog.Panel
            className={`
        !bg-white rounded-lg shadow-lg w-full max-w-sm p-6
        md:max-w-sm md:rounded-lg
        md:relative
        ${dialogLoading ? "opacity-90" : ""}
      `}
          >
            {/* Title */}
            <HeadlessDialog.Title className="text-lg font-semibold !text-teal-600 text-center md:text-left">
              Konfirmasi
            </HeadlessDialog.Title>

            {/* Message */}
            <div className="mt-2 !text-gray-600 text-center md:text-left">
              {dialogMessage}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col md:flex-row md:justify-end gap-2">
              {/* Cancel */}
              <button
                disabled={dialogLoading}
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded !bg-gray-200 hover:!bg-gray-300 disabled:opacity-50 w-full md:w-auto"
              >
                Batal
              </button>

              {/* Confirm */}
              {dialogAction && (
                <button
                  onClick={async () => {
                    try {
                      setDialogLoading(true);
                      await dialogAction();
                      setDialogOpen(false);
                    } finally {
                      setDialogLoading(false);
                    }
                  }}
                  disabled={dialogLoading}
                  className="px-4 py-2 rounded !bg-teal-600 !text-white hover:!bg-teal-700 flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
                >
                  {dialogLoading && (
                    <span className="inline-block w-4 h-4 border-2 !border-white !border-t-transparent rounded-full animate-spin" />
                  )}
                  Lanjutkan
                </button>
              )}
            </div>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>

      {/* ✅ Zoom Image Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 !bg-black/80 flex items-center justify-center z-50 p-2 sm:p-6"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className=" w-full h-auto max-h-full object-contain 
            rounded sm:rounded-lg shadow-lg sm:max-w-3xl sm:max-h-[90vh]"
          />
        </div>
      )}

      {/* Modal zoom image */}
      {zoomImage && (
        <div
          className="md:hidden fixed inset-0 !bg-black/90 flex items-center justify-center z-50 p-2 sm:p-6"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            className="
            w-full h-auto max-h-full object-contain
            rounded sm:rounded-lg shadow-lg
            sm:max-w-3xl sm:max-h-[90vh]"
          />
        </div>
      )}
    </div>
  );
};

export default ManageOrdersPage;
