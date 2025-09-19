// src/pages/CheckoutPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";
import { db } from "../../libs/firebase";
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import Dialog from "../../components/common/Dialog";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";


// 📦 pdfmake
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;


type Promotion = {
  id: string;
  promoId: string;
  title: string;
  type: "voucher" | "banner" | "discount";
  voucherCode?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
};


const getBase64FromUrl = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  // 🧩 State
  const [profile, setProfile] = useState<any>(null);
  const [namaPenerima, setNamaPenerima] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kodePromo, setKodePromo] = useState("");
  const [diskon, setDiskon] = useState(0);
  const [availablePromos, setAvailablePromos] = useState<Promotion[]>([]);
  const [kategori, setKategori] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const { orderId } = useParams<{ orderId: string }>();
  const [openDialog, setOpenDialog] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    const fetchDraftOrder = async () => {
      if (!user || !orderId) return;

      try {
        const snap = await getDoc(doc(db, "orders", orderId));
        if (snap.exists()) {
          const data = snap.data() as any;

          setItems(data.items || []);

          // ✅ langsung pake userData dari draft
          const userData = data.userData || {};
          setNamaPenerima(userData.nama || "");
          setTelepon(userData.telepon || "");
          setAlamat(userData.alamat || "");
        } else {
          // ❌ JANGAN pake alert di sini
          navigate("/user/cart");
        }
      } catch (err) {
        console.error("Gagal ambil draft order:", err);
      }
    };

    fetchDraftOrder();
  }, [user, orderId, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchDrafts = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          where("status", "==", "draft")
        );
        const snap = await getDocs(q);
        setDraftCount(snap.size);
      } catch (err) {
        console.error("Gagal ambil draft orders:", err);
      }
    };

    fetchDrafts();
  }, [user]);

  // 🔎 Load items (persist dari localStorage/cart)
  useEffect(() => {
    const stored = localStorage.getItem("checkoutItems");
    if (stored) {
      setItems(JSON.parse(stored));
    } else if (cart.length > 0) {
      setItems(cart.filter((i) => i.selected));
    }
  }, [cart]);

useEffect(() => {
  const unsub = onSnapshot(collection(db, "Promos"), (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
    const aktif = data.filter((p) => p.status === "active");
    setAvailablePromos(aktif);
  });
  return () => unsub();
}, []);

  // 🛒 Hitung subtotal & total
  const subtotal = items.reduce(
    (acc, item) => acc + (item.harga ?? 0) * item.cartQuantity,
    0
  );
  const totalHarga = subtotal - diskon;

  // 📝 Buat pesanan
  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Harus login untuk checkout!");
      return;
    }
    if (!namaPenerima || !telepon || !alamat) {
      if (window.confirm("Profil Anda belum lengkap. Mau isi sekarang?")) {
        navigate("/user/profile");
      }
      return;
    }
    if (!metodePembayaran) {
      alert("Pilih metode pembayaran dulu!");
      return;
    }

    try {
      if (!orderId) {
        alert("Draft order tidak ditemukan!");
        return;
      }

      const safeUserData = {
        nama: namaPenerima,
        telepon,
        alamat,
        email: profile?.email || user?.email || "",
      };

      const orderRef = doc(db, "orders", orderId);

      // 🚀 Update draft → jadi waiting_verification
      await updateDoc(orderRef, {
        userData: safeUserData,
        subtotal,
        diskon,
        total: totalHarga,
        paymentMethod: metodePembayaran,
        metodePembayaran, // biar konsisten
        status: "pending",
        updatedAt: serverTimestamp(),
      });

      // ✅ Ambil field expiresAt dari Firestore (kalau ada)
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.expiresAt) {
          setExpiresAt(data.expiresAt.toDate());
        }
      }

      // Kosongin localStorage biar ga numpuk
      localStorage.removeItem("checkoutItems");

      setOpenDialog(true);
    } catch (err) {
      console.error("Order error:", err);
      alert("Terjadi kesalahan saat membuat pesanan!");
    }
  };

  // ⏳ Auto-expire countdown
  useEffect(() => {
    if (!expiresAt || !orderId) return;

    const timer = setInterval(async () => {
      const now = Date.now();
      const diff = Math.max(0, expiresAt.getTime() - now);
      const secondsLeft = Math.floor(diff / 1000);

      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(timer);
        try {
          const orderRef = doc(db, "orders", orderId);
          await updateDoc(orderRef, {
            status: "expired",
            expiredAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Gagal expire order:", err);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, orderId]);

  // ⏱️ Format countdown
  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 🔹 Upload ke imgbb
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=b8e7c3098b5d082ffab864e87e12d256`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const imageUrl = data.data.url;

      await updateDoc(doc(db, "orders", orderId!), {
        buktiUrl: imageUrl, // atau "receivedPhotoUrl"
        updatedAt: serverTimestamp(),
      });

      alert("✅ Bukti berhasil diupload!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Gagal upload bukti!");
    }
  };

  // 📥 Download PDF
  const handleDownloadPDF = async () => {
    if (!orderId) return;

    const pdfMake = (await import("pdfmake/build/pdfmake")).default;
    const pdfFonts = await import("pdfmake/build/vfs_fonts");
    pdfMake.vfs = pdfFonts.vfs;

    // 🕒 Tanggal sekarang
    const now = new Date();
    const tanggal = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const jam = now.toLocaleTimeString("id-ID");

    // 🔹 ambil logo base64
    const logoBase64 = await getBase64FromUrl("/images/logo-pdf-excel.png");

    const docDefinition: any = {
      content: [
        // 🔹 Header Logo + Title + Date
        {
          columns: [
            {
              image: logoBase64, // ✅ udah base64
              width: 60,
            },
            {
              text: "AM Printing",
              style: "header",
              alignment: "center",
              margin: [0, 15, 0, 0],
            },
            {
              stack: [
                { text: `Tanggal: ${tanggal}`, alignment: "right" },
                { text: `Jam: ${jam}`, alignment: "right" },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // 🔹 Invoice Info
        { text: "INVOICE", style: "subheader", alignment: "center" },
        {
          text: `ID Pesanan: ${orderId}`,
          margin: [0, 5, 0, 20],
          alignment: "center",
        },

        // 🔹 Data Penerima
        { text: "Data Penerima", style: "subheader" },
        { text: `${namaPenerima} | ${telepon}` },
        { text: alamat, margin: [0, 0, 0, 10] },

        // 🔹 Rincian Pesanan
        { text: "Rincian Pesanan", style: "subheader" },
        {
          table: {
            widths: ["*", "auto", "auto"],
            body: [
              [
                { text: "Produk", bold: true },
                { text: "Qty", bold: true },
                { text: "Harga", bold: true },
              ],
              ...items.map((item) => {
                const isService = item.id?.startsWith("SRV");
                const hargaTotal = (item.harga ?? 0) * item.cartQuantity;

                if (isService) {
                  const detailLines = [
                    item.nama,
                    item.srvDetail?.jasa ? `Jasa: ${item.srvDetail.jasa}` : "",
                    item.srvDetail?.bahan
                      ? `Bahan: ${item.srvDetail.bahan}`
                      : "",
                    item.srvDetail?.notes
                      ? `Catatan: ${item.srvDetail.notes}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n");

                  return [
                    { text: detailLines, fontSize: 10 },
                    item.cartQuantity,
                    formatCurrency(hargaTotal),
                  ];
                }

                return [
                  item.nama,
                  item.cartQuantity,
                  formatCurrency(hargaTotal),
                ];
              }),
              [
                { text: "Subtotal", colSpan: 2, alignment: "right" },
                {},
                formatCurrency(subtotal),
              ],
              ...(diskon > 0
                ? [
                    [
                      {
                        text: "Diskon",
                        colSpan: 2,
                        alignment: "right",
                        color: "green",
                      },
                      {},
                      `-${formatCurrency(diskon)}`,
                    ],
                  ]
                : []),
              [
                { text: "Total", colSpan: 2, alignment: "right", bold: true },
                {},
                formatCurrency(totalHarga),
              ],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
        },

        // 🔹 Footer
        {
          text: "Terima kasih sudah belanja di Mandiri Printing!",
          alignment: "center",
          margin: [0, 10, 0, 40],
        },
        {
          columns: [
            { text: "" },
            {
              stack: [
                { text: "Hormat Kami,", alignment: "center" },
                { text: "\n\n\n(___________________)", alignment: "center" },
                {
                  text: "Mandiri Printing",
                  alignment: "center",
                  italics: true,
                },
              ],
              width: 200,
              alignment: "center",
            },
            { text: "" },
          ],
        },
      ],

      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${orderId}.pdf`);
  };
  // 📌 Data pembayaran
  const dataPembayaran: Record<
    string,
    { value: string; label: string; logo: string }[]
  > = {
    "Transfer Bank": [
      { value: "BRI", label: "BRI", logo: "/images/payment/bri.svg" },
      { value: "BNI", label: "BNI", logo: "/images/payment/bni.svg" },
      { value: "BCA", label: "BCA", logo: "/images/payment/bca.svg" },
      { value: "Hana", label: "Hana", logo: "/images/payment/hana.svg" },
      { value: "OCBC", label: "OCBC", logo: "/images/payment/ocbc.svg" },
      {
        value: "Mandiri",
        label: "Mandiri",
        logo: "/images/payment/mandiri.svg",
      },
    ],
    "E-Wallet": [
      { value: "GoPay", label: "GoPay", logo: "/images/payment/gopay.svg" },
      { value: "OVO", label: "OVO", logo: "/images/payment/ovo.svg" },
      { value: "DANA", label: "DANA", logo: "/images/payment/dana.svg" },
      {
        value: "ShopeePay",
        label: "ShopeePay",
        logo: "/images/payment/shopeepay.svg",
      },
    ],
    COD: [
      {
        value: "COD",
        label: "Bayar di Tempat",
        logo: "/images/payment/cod.svg",
      },
    ],
  };

  // 📌 Rekening pribadi
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

  

  // 🔎 Ambil profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snapshot = await getDoc(doc(db, "users", user.uid));
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data);
        setNamaPenerima(data.nama || "");
        setTelepon(data.telepon || "");
        setAlamat(data.alamat || "");
      }
    };
    fetchProfile();
  }, [user]);

  // 🎟️ Apply promo
  const handleApplyPromo = async () => {
    if (!kodePromo.trim()) {
      alert("Masukkan kode promo terlebih dahulu!");
      return;
    }

    try {
      const promoRef = doc(db, "Promos", kodePromo);
      const promoSnap = await getDoc(promoRef);

      if (!promoSnap.exists()) {
        alert("Kode promo tidak ditemukan!");
        return;
      }

      const promoData = promoSnap.data();
      const now = new Date();

      if (
        promoData.status !== "active" ||
        now < new Date(promoData.startDate) ||
        now > new Date(promoData.endDate)
      ) {
        alert("Kode promo tidak aktif atau sudah kadaluarsa!");
        return;
      }

      const potongan = Math.floor((subtotal * promoData.discountPercent) / 100);
      setDiskon(potongan);

      alert(
        `Kode promo berhasil diterapkan! Diskon ${promoData.discountPercent}%`
      );
    } catch (err) {
      console.error("❌ Error applying promo:", err);
      alert("Terjadi kesalahan saat validasi promo.");
    }
  };


  // 🚫 Kondisi awal
  if (!user) return <p>Harus login untuk checkout.</p>;
  if (items.length === 0) return <p>Tidak ada item yang dipilih.</p>;

  // 🧩 Dialog content
  const pesanDialog = (
    <div className="max-h-[70vh] overflow-y-auto px-4 space-y-4 scroll-mt-16">
      <p className="font-semibold">ID Pesanan (Resi): {orderId}</p>
      <p className="text-sm !text-red-600">
        Segera lakukan pembayaran dalam{" "}
        <span className="font-bold">{formatCountdown(countdown)}</span>
      </p>

      {/* Bank Info */}
      {rekeningPribadi[metodePembayaran] && (
        <div className="!bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-3">
          <img
            src={
              dataPembayaran["Transfer Bank"].find(
                (b) => b.value === metodePembayaran
              )?.logo || ""
            }
            alt={metodePembayaran}
            className="h-8"
          />
          <div>
            <p>
              <strong>Bank:</strong> {rekeningPribadi[metodePembayaran].bank}
            </p>
            <p>
              <strong>No. Rekening:</strong>{" "}
              {rekeningPribadi[metodePembayaran].norek}
            </p>
            <p>
              <strong>Atas Nama:</strong>{" "}
              {rekeningPribadi[metodePembayaran].nama}
            </p>
          </div>
        </div>
      )}

      {/* Rincian Produk */}
      <div className="!bg-gray-50 rounded-lg p-3 text-sm">
        <h4 className="font-medium mb-2">Rincian Pesanan</h4>

        {items.map((item, idx) => {
          const isService = item.id?.startsWith("SRV");
          const hargaTotal = (item.harga ?? 0) * item.cartQuantity;

          return (
            <div key={item.id || `item-${idx}`} className="py-2 border-b">
              {isService ? (
                <div className="space-y-1">
                  {/* Nama */}
                  <p className="font-medium">{item.nama}</p>

                  {/* Jasa */}
                  {item.srvDetail?.jasa && (
                    <p className="text-sm text-gray-600">
                      Jasa: {item.srvDetail.jasa}
                    </p>
                  )}

                  {/* Bahan */}
                  {item.srvDetail?.bahan && (
                    <p className="text-sm text-gray-600">
                      Bahan: {item.srvDetail.bahan}
                    </p>
                  )}

                  {/* Notes */}
                  {item.srvDetail?.notes && (
                    <p className="text-sm text-gray-600 italic">
                      Catatan: "{item.srvDetail.notes}"
                    </p>
                  )}

                  {/* DesignUrls */}
                  {Array.isArray(item.srvDetail?.designUrls) &&
                    item.srvDetail.designUrls.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {item.srvDetail.designUrls.map(
                          (url: string, i: number) => (
                            <img
                              key={`${item.id}-design-${i}`}
                              src={url}
                              alt={`Design ${i + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )
                        )}
                      </div>
                    )}

                  {/* Qty & Harga */}
                  <div className="flex justify-between mt-1">
                    <span>
                      x{item.cartQuantity} @ {formatCurrency(item.harga ?? 0)}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(hargaTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>
                    {item.nama} x{item.cartQuantity}
                  </span>
                  <span>{formatCurrency(hargaTotal)}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="border-t border-dashed mt-2 pt-2" />
        <div className="flex justify-between mt-2">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {diskon > 0 && (
          <div className="flex justify-between !text-green-600">
            <span>Diskon</span>
            <span>-{formatCurrency(diskon)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>{formatCurrency(totalHarga)}</span>
        </div>
      </div>

      {/* Barcode & QR */}
      <div className="flex flex-col items-center gap-4">
        <Barcode
          value={`${window.location.origin}/user/orders/${orderId}`}
          height={60}
          width={2}
          format="CODE128"
        />
        <QRCodeCanvas
          value={`${window.location.origin}/user/orders/${orderId}`}
          size={128}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 sticky bottom-0 bg-white py-2">
        <button
          onClick={handleDownloadPDF}
          className="!bg-green-500 !text-white px-4 py-2 rounded hover:!bg-green-600"
        >
          Download PDF
        </button>
        <button className="!bg-blue-500 !text-white px-4 py-2 rounded hover:!bg-blue-600 relative overflow-hidden">
          Upload Bukti
          <input
            type="file"
            accept="image/*"
            capture="environment" // langsung buka kamera
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 mt-16 space-y-6">
      <h2 className="text-xl font-semibold">Checkout</h2>

      {/* ⚠️ Draft warning */}
      {draftCount > 0 && (
        <div className="!bg-yellow-50 border !border-yellow-300 !text-yellow-700 p-3 rounded mb-4">
          ⚠️ Kamu punya <strong>{draftCount}</strong> pesanan draft yang belum
          diselesaikan.
        </div>
      )}

      {/* 🧩 Data Penerima */}
      <div className="!bg-white shadow rounded-lg p-4 space-y-2">
        <h3 className="font-medium mb-2">Data Penerima</h3>
        <input
          type="text"
          placeholder="Nama Penerima"
          value={namaPenerima}
          onChange={(e) => setNamaPenerima(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="No. Telepon"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Alamat Lengkap"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* 🛍️ Produk */}
      <div className="!bg-white shadow rounded-lg p-4">
        <h3 className="font-medium mb-2">Produk</h3>

        {items.map((item, idx) => {
          const isService = item.id?.startsWith("SRV");
          const hargaTotal = (item.harga ?? 0) * item.cartQuantity;

          return (
            <div key={item.id || `produk-${idx}`} className="py-2 border-b">
              {isService ? (
                <div className="space-y-1">
                  {/* Nama */}
                  <p className="font-medium">{item.nama}</p>

                  {/* Jasa */}
                  {item.srvDetail?.jasa && (
                    <p className="text-sm text-gray-600">
                      Jasa: {item.srvDetail.jasa}
                    </p>
                  )}

                  {/* Bahan */}
                  {item.srvDetail?.bahan && (
                    <p className="text-sm text-gray-600">
                      Bahan: {item.srvDetail.bahan}
                    </p>
                  )}

                  {/* Notes */}
                  {item.srvDetail?.notes && (
                    <p className="text-sm text-gray-600 italic">
                      Catatan: "{item.srvDetail.notes}"
                    </p>
                  )}

                  {/* DesignUrls */}
                  {Array.isArray(item.srvDetail?.designUrls) &&
                    item.srvDetail.designUrls.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {item.srvDetail.designUrls.map(
                          (url: string, i: number) => (
                            <img
                              key={`${item.id}-produk-design-${i}`}
                              src={url}
                              alt={`Design ${i + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )
                        )}
                      </div>
                    )}

                  {/* Qty & Harga */}
                  <div className="flex justify-between mt-1">
                    <span>
                      x{item.cartQuantity} @ {formatCurrency(item.harga ?? 0)}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(hargaTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>
                    {item.nama} x{item.cartQuantity}
                  </span>
                  <span>{formatCurrency(hargaTotal)}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-between mt-2">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {diskon > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Diskon</span>
            <span>-{formatCurrency(diskon)}</span>
          </div>
        )}
        <div className="flex justify-between mt-2 font-bold">
          <span>Total</span>
          <span>{formatCurrency(totalHarga)}</span>
        </div>
      </div>

      {/* 💳 Metode Pembayaran */}
      <div className="!bg-white shadow rounded-lg p-4">
        <h3 className="font-medium mb-2">Metode Pembayaran</h3>
        <div className="space-y-3">
          {Object.keys(dataPembayaran).map((kategoriItem) => (
            <div key={kategoriItem} className="border rounded-lg">
              <button
                className="w-full flex justify-between items-center p-3 font-medium !bg-white hover:!bg-gray-50"
                onClick={() =>
                  setKategori(kategori === kategoriItem ? "" : kategoriItem)
                }
              >
                {kategoriItem}
                <span>{kategori === kategoriItem ? "▲" : "▼"}</span>
              </button>
              {kategori === kategoriItem && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
                  {dataPembayaran[kategoriItem].map((item) => (
                    <label
                      key={item.value}
                      className={`flex flex-col items-center border rounded-lg p-3 cursor-pointer transition ${
                        metodePembayaran === item.value
                          ? "!border-blue-500 !bg-blue-50"
                          : "!border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={item.value}
                        checked={metodePembayaran === item.value}
                        onChange={() => setMetodePembayaran(item.value)}
                        className="hidden"
                      />
                      <img
                        src={item.logo}
                        alt={item.label}
                        className="h-8 mb-2"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🎟️ Kode Promo */}
      <div className="!bg-white shadow rounded-lg p-4 space-y-3 relative">
        <h3 className="font-medium mb-2">Kode Promo</h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode promo"
            value={kodePromo}
            onChange={(e) => setKodePromo(e.target.value)}
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={handleApplyPromo}
            className="!bg-blue-500 !text-white px-4 rounded hover:!bg-blue-600"
          >
            Apply
          </button>
        </div>

        {/* 🔍 Autocomplete dropdown */}
        {kodePromo && (
          <div className="absolute bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto shadow z-10">
            {availablePromos
              .filter((promo) =>
                (promo.voucherCode || promo.title)
                  .toLowerCase()
                  .includes(kodePromo.toLowerCase())
              )
              .map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => {
                    setKodePromo(promo.voucherCode || "");
                    handleApplyPromo();
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:!bg-blue-100"
                >
                  {promo.voucherCode || promo.title} ({promo.discountPercent}%)
                </div>
              ))}

            {/* Kalau ga ada hasil */}
            {availablePromos.filter((promo) =>
              (promo.voucherCode || promo.title)
                .toLowerCase()
                .includes(kodePromo.toLowerCase())
            ).length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                Promo tidak ditemukan
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🚀 Button */}
      <button
        onClick={handlePlaceOrder}
        className="w-full !bg-red-500 !text-white py-2 rounded-lg hover:!bg-red-600"
      >
        Buat Pesanan
      </button>

      {/* 💬 Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          navigate(`/user/orders/${orderId}`);
        }}
        title="Pesanan Berhasil!"
        message={pesanDialog}
      />
    </div>
  );
};

export default CheckoutPage;
