import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../libs/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../../hooks/useAuth";
import type { OrderStatus } from "../../types/order";
import { Star } from "lucide-react";
import Barcode from "react-barcode";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { formatCurrency } from "../../utils/formatCurrency";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Download, Printer, Copy, CheckCircle, XCircle } from "lucide-react";

// 🆕 tambahan
import { uploadToImgBB } from "../../libs/imgbb";
import JsBarcode from "jsbarcode";

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

// mapping dari paymentMethod → rekening key
const metodeMap: Record<string, string> = {
  bank_transfer: "BRI",   // default ke BRI misalnya
  credit_card: "Mandiri", // contoh
  ewallet: "OVO",         // contoh
  cod: "DANA",            // misal ganti ke apa
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

function ConfirmationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<{
    status: OrderStatus;
    [key: string]: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number>(0);
  const metodePembayaran = order?.paymentMethod || "";
  const rekeningKey = metodeMap[metodePembayaran] || metodePembayaran;
  const [reviews, setReviews] = useState<Record<string, { rating: number; text: string }>>({});
  const [reviewPhotos, setReviewPhotos] = useState<Record<string, File | null>>({});
  const [showReviews, setShowReviews] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const rekening = rekeningKey ? rekeningPribadi[rekeningKey] : null;
  const logoSrc = rekeningKey
    ? logoSrcMap[rekeningKey] || "/images/payment/default.svg"
    : "/images/payment/default.svg";
  // 🆕 upload bukti state
  const [bukti, setBukti] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (order) {
      console.log("🔥 metodePembayaran:", order.metodePembayaran);
    }
  }, [order]);

  // 🔎 Ambil data order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const snap = await getDoc(doc(db, "orders", id));
        if (!snap.exists()) {
          console.error("Order tidak ditemukan:", id);
          setOrder(null);
          return;
        }

        const data = snap.data();

        setOrder({
          ...data,
          status: data.status as OrderStatus, // ✅ pastiin status ada
          items: data.items || [],
          paymentMethod: data.paymentMethod || "",
        });

        // ⏳ hitung countdown expire
        if (data.expiresAt instanceof Timestamp) {
          const deadline = data.expiresAt.toDate().getTime();
          const diff = deadline - Date.now();
          setCountdown(diff > 0 ? diff : 0);

          if (diff <= 0 && data.status === "pending") {
            await updateDoc(doc(db, "orders", id), { status: "expired" });
            setOrder((prev: any) => ({ ...prev, status: "expired" }));
          }
        }
      } catch (err) {
        console.error("Gagal ambil order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // ⏳ Update countdown + expired
  useEffect(() => {
    if (!countdown || !id) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          if (order?.status === "pending") {
            updateDoc(doc(db, "orders", id), { status: "expired" });
            setOrder((prev: any) => ({ ...prev, status: "expired" }));
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, id, order]);

  useEffect(() => {
    if (!id || !order) return;

    const baseUrl = `${window.location.origin}/user/orders/${id}`;

    let qrValue = "";
    switch (order.status) {
      case "draft":
        qrValue = `Order ${id} masih draft 📝 | ${baseUrl}`;
        break;
      case "pending":
        qrValue = `Order ${id} menunggu pembayaran ⏳ | ${baseUrl}`;
        break;
      case "waiting_verification":
        qrValue = `Order ${id} menunggu verifikasi admin 👀 | ${baseUrl}`;
        break;
      case "rejected":
        qrValue = `Order ${id} ditolak ❌ | ${baseUrl}`;
        break;
      case "confirmed":
        qrValue = `Order ${id} sudah dikonfirmasi ✅ | ${baseUrl}`;
        break;
      case "processing":
        qrValue = `Order ${id} sedang diproses ⚙️ | ${baseUrl}`;
        break;
      case "shipped":
        qrValue = `Order ${id} sudah dikirim 🚚 | ${baseUrl}`;
        break;
      case "delivered":
        qrValue = `Order ${id} sudah diterima 📦 | ${baseUrl}`;
        break;
      case "completed":
        qrValue = `Order ${id} selesai 🎉 Terima kasih 🙌 | ${baseUrl}`;
        break;
      default:
        qrValue = baseUrl;
    }

    setQrValue(qrValue);
    setBarcodeValue(id); // ✅ barcode cukup orderId aja, biar rapih
  }, [id, order]);

  const handleUploadBuktiTerima = async () => {
    if (!bukti || !id) return alert("Pilih foto dulu!");
    setUploading(true);

    try {
      const url = await uploadToImgBB(bukti);
      if (!url) throw new Error("Upload gagal!");

      const receivedAt = new Date();

      await updateDoc(doc(db, "orders", id), {
        receivedPhotoUrl: url,
        receivedAt,
        status: "delivered",
      });

      setOrder((prev: any) => ({
        ...prev,
        receivedPhotoUrl: url,
        receivedAt,
      }));

      alert("✅ Bukti penerimaan berhasil diupload!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal upload bukti!");
    } finally {
      setUploading(false);
    }
  };

const handleSubmitReview = async (productId: string) => {
  if (!id || !order) return;

  const review = reviews[productId];
  if (!review || (review.rating === 0 && !review.text.trim())) {
    alert("Kasih rating atau komentar dulu bos!");
    return;
  }

  try {
    // 🔑 Data user
    const userName = user?.displayName || order.userData?.fullName || "Anonim";

    // 📷 Upload foto kalau ada
    let reviewUrl: string = "";
    if (reviewPhotos[productId]) {
      reviewUrl = (await uploadToImgBB(reviewPhotos[productId]!)) || "";
    }


    // 🔹 Simpan review ke array produk
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      rating: arrayUnion({
        user: userName,
        bintang: review.rating,
        komentar: review.text,
        reviewUrl, // 🆕 simpan foto review
      }),
    });

    // 🔹 Hitung ulang rata-rata
    const snap = await getDoc(productRef);
    if (snap.exists()) {
      const data = snap.data();
      const ratings = data.rating || [];
      const avg =
        ratings.reduce((sum: number, r: any) => sum + r.bintang, 0) /
        ratings.length;

      await updateDoc(productRef, { penilaian: avg });
    }

    alert("✅ Review berhasil ditambahkan!");
    setReviews((prev) => ({ ...prev, [productId]: { rating: 0, text: "" } }));
    setReviewPhotos((prev) => ({ ...prev, [productId]: null }));
  } catch (err) {
    console.error("❌ Gagal simpan review:", err);
    alert("❌ Gagal simpan review");
  }
};

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // 📤 Upload bukti transfer
  const handleUploadBukti = async () => {
    if (!bukti || !id) return alert("Pilih file dulu!");
    setUploading(true);

    try {
      const url = await uploadToImgBB(bukti);
      if (!url) {
        alert("❌ Upload gagal!");
        return;
      }

      await updateDoc(doc(db, "orders", id), {
        buktiUrl: url,
        status: "waiting_verification",
      });

      setOrder((prev: any) => ({
        ...prev,
        buktiUrl: url,
        status: "waiting_verification",
      }));
      alert("✅ Bukti pembayaran berhasil diupload!");
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan upload!");
    } finally {
      setUploading(false);
    }
  };

  // 📥 Download PDF pakai pdf-lib
  const handleDownloadPDF = async () => {
    if (!order) return;

    const pdfDoc = await PDFDocument.create();
    const pageWidth = 226; // 80mm struk
    const pageHeight = 600;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = pageHeight - 20;

    const drawText = (
      text: string,
      size = 10,
      color = rgb(0, 0, 0),
      x = 10
    ) => {
      page.drawText(text, { x, y, size, font, color });
      y -= 14;
      if (y < 40) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 20;
      }
    };

    const drawLine = () => {
      drawText("---------------------------------", 10, rgb(0, 0, 0));
    };

    const drawWrappedText = (
      text: string,
      x: number,
      maxWidth: number,
      size = 9,
      color = rgb(0, 0, 0)
    ) => {
      const paragraphs = text.split("\n"); // 🔹 pecah kalau ada newline

      paragraphs.forEach((para) => {
        const words = para.split(" ");
        let line = "";
        const lines: string[] = [];

        words.forEach((word) => {
          const testLine = line ? `${line} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, size);
          if (width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        if (line) lines.push(line);

        // gambar tiap baris
        lines.forEach((lineText) => {
          page.drawText(lineText, { x, y, size, font, color });
          y -= size + 4;
        });
      });
    };

    // 🔹 Logo
    try {
      const response = await fetch("/images/logo-pdf-excel.png");
      const logoBytes = await response.arrayBuffer();
      const logoEmbed = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoEmbed, {
        x: (pageWidth - 60) / 2,
        y: y - 40,
        width: 60,
        height: 40,
      });
      y -= 50;
    } catch {}

    page.drawText("AM-Printing", { x: pageWidth / 2 - 30, y, size: 12, font });
    y -= 20;

    drawWrappedText(
      "Jl. Kapt Hanafiah Karanganyar Perum BSK Kp.Rawabadak Subang, Jawa Barat",
      10, // x posisi
      pageWidth - 20, // maxWidth
      9,
      rgb(0.3, 0.3, 0.3)
    );
    y -= 10;

    page.drawText("Struk Pembayaran", {
      x: pageWidth / 2 - 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0.6),
    });
    y -= 20;
    drawLine();

    // Info Order
    drawText(`ID Order : ${id}`);
    drawText(`Status   : ${order.status}`);
    if (countdown > 0 && order.status === "pending") {
      drawText(`Batas    : ${formatCountdown(countdown)}`, 10, rgb(1, 0, 0));
    }
    drawLine();

    // Informasi Pembayaran
    drawText("Informasi Pembayaran", 11, rgb(0, 0, 0.6));
    drawLine();
    const rekening = rekeningPribadi[order.metodePembayaran] || null;
    if (rekening) {
      drawText(`Bank  : ${rekening.bank}`);
      drawText(`No Rek: ${rekening.norek}`);
      drawText(`Nama  : ${rekening.nama}`);
    }
    drawLine();

    // Rincian Pesanan
    drawText("Rincian Pesanan", 11, rgb(0, 0, 0.6));
    drawLine();

    // Header Tabel
    page.drawText("Barang", { x: 10, y, size: 9, font });
    page.drawText("Qty", { x: 80, y, size: 9, font });
    page.drawText("Harga", { x: 120, y, size: 9, font });
    page.drawText("Total", { x: 180, y, size: 9, font });
    y -= 14;

    (order.items || []).forEach((item: any) => {
      const nama = item.nama || item.productName || "-";
      const qty = item.cartQuantity ?? item.quantity ?? 0;
      const harga = item.harga ?? item.price ?? 0;
      const total = harga * qty;

      if (item.productId?.startsWith("SRV")) {
        // 🔹 Nama utama
        drawText(nama, 9, rgb(0, 0, 0));

        // 🔹 Jasa
        if (item.srvDetail?.jasa) {
          drawText(`Jasa   : ${item.srvDetail.jasa}`, 8, rgb(0.3, 0.3, 0.3));
        }

        // 🔹 Bahan
        if (item.srvDetail?.bahan) {
          drawText(`Bahan  : ${item.srvDetail.bahan}`, 8, rgb(0.3, 0.3, 0.3));
        }

        // 🔹 Notes
        if (item.srvDetail?.notes) {
          drawText(`Notes  : ${item.srvDetail.notes}`, 8, rgb(0.3, 0.3, 0.3));
        }

        // 🔹 DesignUrls (print url aja biar hemat space)
        if (Array.isArray(item.srvDetail?.designUrls)) {
          item.srvDetail.designUrls.forEach((url: string, i: number) => {
            drawText(`Design ${i + 1}: ${url}`, 7, rgb(0.2, 0.2, 0.2));
          });
        }

        // 🔹 Qty & Harga
        drawText(
          `x${qty} @ ${formatCurrency(harga)} = ${formatCurrency(total)}`,
          9,
          rgb(0, 0, 0)
        );
      } else {
        // produk biasa
        page.drawText(nama.substring(0, 12), { x: 10, y, size: 9, font });
        page.drawText(String(qty), { x: 85, y, size: 9, font });
        page.drawText(formatCurrency(harga), { x: 110, y, size: 9, font });
        page.drawText(formatCurrency(total), { x: 160, y, size: 9, font });
        y -= 14;
      }
    });

    drawLine();

    // Subtotal & Diskon
    page.drawText("Sub Total :", { x: 10, y, size: 9, font });
    page.drawText(formatCurrency(order.subtotal), { x: 160, y, size: 9, font });
    y -= 14;

    if (order.diskon > 0) {
      page.drawText("Diskon :", { x: 10, y, size: 9, font });
      page.drawText("-" + formatCurrency(order.diskon), {
        x: 160,
        y,
        size: 9,
        font,
      });
      y -= 14;
    }

    drawLine();

    // TOTAL
    page.drawText("TOTAL :", { x: 10, y, size: 12, font });
    page.drawText(formatCurrency(order.total), {
      x: 150,
      y,
      size: 12,
      font,
    });
    y -= 20;

    // Data Penerima
    drawText("Data Penerima", 11, rgb(0, 0, 0.6));
    drawLine();

    drawText(`Nama   : ${order.userData?.nama || order.customer?.nama || "-"}`);
    drawText(
      `Telp   : ${order.userData?.telepon || order.customer?.telepon || "-"}`
    );
    drawText(
      `Email  : ${order.userData?.email || order.customer?.email || "-"}`
    );

    // 🆕 alamat panjang otomatis wrap (sama kayak alamat toko)
    const alamatPenerima =
      order.userData?.alamat || order.customer?.alamat || "-";
    drawWrappedText(
      `Alamat : ${alamatPenerima}`,
      10,
      pageWidth - 20,
      9,
      rgb(0, 0, 0)
    );

    drawLine();

    // Barcode (cukup ID biar scanner fisik gampang baca)
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, id || "", { format: "CODE128", width: 1.5, height: 40 });
    const barcodeImg = canvas.toDataURL("image/png");
    const barcodeEmbed = await pdfDoc.embedPng(barcodeImg);
    page.drawImage(barcodeEmbed, { x: 20, y: y - 50, width: 180, height: 40 });
    y -= 60;

    // QR (dynamic link ke ConfirmationPage)
    const baseUrl = `${window.location.origin}/user/orders/${id}`;
    const qrValue = `Order ${id} | ${baseUrl}`; // bisa tambahin status juga kalau mau
    const qrDataUrl = await QRCode.toDataURL(qrValue, { width: 100 });
    const qrEmbed = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrEmbed, { x: 70, y: y - 100, width: 100, height: 100 });
    y -= 120;

    // Teks bawah QR
    page.drawText("Scan untuk detail order", {
      x: 40,
      y,
      size: 8,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;

    // ✅ Save & Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: "application/pdf",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resi_${id}.pdf`;
    link.click();
  };

  // 🖨 Print biasa
  const handlePrint = () => window.print();

  // ✅ Konfirmasi Pesanan
  const handleConfirmPayment = async () => {
    if (!id || !order) return;
    try {
      const now = new Date();

      await setDoc(doc(db, "userOrders", id), {
        ...order,
        orderId: id,
        confirmedAt: now,
        status: "confirmed",
      });

      await setDoc(doc(db, "orderHistory", id), {
        ...order,
        orderId: id,
        confirmedAt: now,
        status: "confirmed",
      });

      await updateDoc(doc(db, "orders", id), { status: "confirmed" });

      setOrder((prev: any) => ({ ...prev, status: "confirmed" }));
      alert("✅ Pesanan dikonfirmasi!");
      navigate("/user/orders");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal konfirmasi pesanan!");
    }
  };

  // ❌ Batalkan Pesanan
  const handleCancelOrder = async () => {
    if (!id) return;
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?"))
      return;

    try {
      await deleteDoc(doc(db, "orders", id));
      alert("❌ Pesanan berhasil dibatalkan!");
      navigate("/user/orders");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal membatalkan pesanan!");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Pesanan tidak ditemukan.</div>;

  return (
    <div className="mt-16 p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">
        Konfirmasi Pembayaran
      </h1>
      {/* 🧾 Kartu Resi */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
        {/* Order Info */}
        <div>
          <strong>ID Order:</strong> {id}
        </div>
        <div>
          <strong>Status:</strong> {order.status}
        </div>
        {order.metodePembayaran && (
          <div className="flex items-center gap-2 mt-1">
            <strong>Metode Pembayaran:</strong>
            {logoSrc && (
              <img
                src={logoSrc}
                alt={rekening?.bank || order.metodePembayaran}
                className="h-6 w-auto"
              />
            )}
            <span>{rekening?.bank || order.metodePembayaran}</span>
          </div>
        )}
        {countdown > 0 && order.status === "pending" && (
          <div className="!text-red-600 font-semibold">
            Batas pembayaran: {formatCountdown(countdown)}
          </div>
        )}

        {/* 💳 Informasi Pembayaran */}
        {rekening && (
          <div className="bg-gray-50 p-3 rounded text-sm sm:text-base">
            <h3 className="font-medium mb-2">Informasi Pembayaran</h3>
            <img
              src={logoSrc}
              alt={rekening.bank}
              className="w-auto h-14 mb-3"
            />
            <div>
              <strong>Bank:</strong> {rekening.bank}
            </div>
            <div className="flex items-center gap-2">
              <strong>No. Rekening:</strong>
              <span className="font-mono">{rekening.norek}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rekening.norek);
                  alert("Nomor rekening disalin!");
                }}
                className="!text-blue-600 hover:!text-blue-800"
              >
                <Copy size={16} />
              </button>
            </div>
            <div>
              <strong>Atas Nama:</strong> {rekening.nama}
            </div>
          </div>
        )}

        {/* 🏷️ Barcode + QR */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 my-6">
          {/* Barcode (link aja) */}
          <div className="flex flex-col items-center gap-2">
            {barcodeValue && (
              <Barcode
                value={barcodeValue}
                height={60}
                width={2}
                format="CODE128"
              />
            )}
            <p className="text-sm font-mono mt-1">{id}</p>
          </div>

          {/* QR Code (dynamic) */}
          <div className="flex flex-col items-center gap-2">
            {qrValue && <QRCodeCanvas value={qrValue} size={120} />}
            <p className="text-xs text-gray-500">Scan untuk detail order</p>
          </div>
        </div>

        {/* 👤 Data Penerima */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-2">Data Penerima</h3>
          <div>
            <strong>Nama:</strong>{" "}
            {order.userData?.nama || order.customer?.nama || "-"}
          </div>
          <div>
            <strong>Telepon:</strong>{" "}
            {order.userData?.telepon || order.customer?.telepon || "-"}
          </div>
          <div>
            <strong>Alamat:</strong>{" "}
            {order.userData?.alamat || order.customer?.alamat || "-"}
          </div>
          <div>
            <strong>Email:</strong>{" "}
            {order.userData?.email || order.customer?.email || "-"}
          </div>
        </div>

        {/* 📦 Produk */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-2">Rincian Pesanan</h3>
          {(order.items || []).map((item: any, idx: number) => {
            const nama = item.nama || item.productName || "-";
            const qty = item.cartQuantity ?? item.quantity ?? 0;
            const harga = item.harga ?? item.price ?? 0;
            const total = harga * qty;

            return (
              <div
                key={item.id || item.productId || idx}
                className="border-b py-2 space-y-1"
              >
                {item.productId?.startsWith("SRV") ? (
                  <>
                    {/* Nama */}
                    <p className="font-medium">{nama}</p>

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
                                key={`${item.productId}-design-${i}`}
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
                        x{qty} @ {formatCurrency(harga)}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>
                      {nama} x{qty}
                    </span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-between mt-2 font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.diskon > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>-{formatCurrency(order.diskon)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* 🖼 Upload Bukti Transfer */}
      {order.status === "pending" && (
        <div className="!bg-white shadow rounded-lg p-4">
          <h3 className="font-medium mb-2">Upload Bukti Transfer</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBukti(e.target.files?.[0] || null)}
            className="mb-2 w-full text-sm"
          />

          {/* ✅ preview sebelum upload */}
          {bukti && (
            <div className="mt-3">
              <p className="text-sm font-medium">Preview:</p>
              <img
                src={URL.createObjectURL(bukti)}
                alt="Preview bukti"
                className="mt-2 mb-2 w-48 border rounded"
              />
            </div>
          )}

          <button
            onClick={handleUploadBukti}
            disabled={uploading || !bukti}
            className="!bg-blue-500 !text-white px-4 py-2 rounded hover:!bg-blue-600 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {order.buktiUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium">Bukti Terupload:</p>
              <img
                src={order.buktiUrl}
                alt="Bukti transfer"
                className="mt-2 w-48 border rounded"
              />
            </div>
          )}
        </div>
      )}

      {/* 📷 Upload Bukti Penerimaan */}
      {order.status === "delivered" && (
        <div className="!bg-white shadow rounded-lg p-4">
          <h3 className="font-medium mb-2">Upload Bukti Penerimaan</h3>
          <input
            type="file"
            accept="image/*"
            capture="environment" // 📸 langsung kamera di HP
            onChange={(e) => setBukti(e.target.files?.[0] || null)}
            className="mb-2 w-full text-sm"
          />
          {bukti && (
            <img
              src={URL.createObjectURL(bukti)}
              alt="Preview bukti"
              className="mt-2 w-48 border rounded"
            />
          )}
          <button
            onClick={handleUploadBuktiTerima}
            disabled={uploading || !bukti}
            className="!bg-blue-500 !text-white px-4 py-2 rounded hover:!bg-blue-600 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {/* ✅ Bukti + Review */}
      {order.status === "completed" && (
        <div className="!bg-white shadow rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Bukti Penerimaan</h3>
          {order.receivedPhotoUrl ? (
            <div>
              <img
                src={order.receivedPhotoUrl}
                alt="Bukti terima"
                className="w-48 border rounded"
              />
              {order.receivedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Diterima pada:{" "}
                  {new Date(order.receivedAt.seconds * 1000).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Belum ada bukti penerimaan</p>
          )}

          {/* ⭐ Review */}
          <div>
            <h3
              className="font-medium mb-2 cursor-pointer flex items-center justify-between"
              onClick={() => setShowReviews((prev) => !prev)}
            >
              Beri Ulasan Produk
              <span className="text-sm text-gray-500">
                {showReviews ? "▲" : "▼"}
              </span>
            </h3>

            {showReviews && (
              <div className="space-y-4">
                {(order.items || []).map((item: any) => {
                  const review = reviews[item.productId] || {
                    rating: 0,
                    text: "",
                  };

                  return (
                    <div key={item.productId} className="mt-2 border-t pt-3">
                      <p className="text-sm font-semibold">
                        {item.nama || item.productName}
                      </p>

                      {/* ⭐ rating pakai Lucide Star */}
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            className={`cursor-pointer ${
                              star <= review.rating
                                ? "!text-yellow-500 !fill-yellow-500"
                                : "text-gray-300"
                            }`}
                            onClick={() =>
                              setReviews((prev) => ({
                                ...prev,
                                [item.productId]: { ...review, rating: star },
                              }))
                            }
                          />
                        ))}
                      </div>

                      {/* 📝 komentar */}
                      <textarea
                        value={review.text}
                        onChange={(e) =>
                          setReviews((prev) => ({
                            ...prev,
                            [item.productId]: {
                              ...review,
                              text: e.target.value,
                            },
                          }))
                        }
                        placeholder="Tulis ulasan kamu di sini..."
                        className="w-full p-2 border rounded text-sm mb-2"
                      />

                      {/* 📷 Upload Foto Review */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setReviewPhotos((prev) => ({
                            ...prev,
                            [item.productId]: e.target.files?.[0] || null,
                          }))
                        }
                        className="mb-2 w-full text-sm"
                      />

                      {reviewPhotos[item.productId] && (
                        <img
                          src={
                            reviewPhotos[item.productId]
                              ? URL.createObjectURL(
                                  reviewPhotos[item.productId]!
                                )
                              : ""
                          }
                          alt="Preview review"
                          className="w-24 h-24 object-cover rounded border mb-2"
                        />
                      )}

                      <button
                        onClick={() => handleSubmitReview(item.productId)}
                        className="!bg-green-500 !text-white px-4 py-1 rounded hover:!bg-green-600"
                      >
                        Kirim Ulasan
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔘 Tombol Aksi */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 !bg-green-500 !text-white px-4 py-2 rounded hover:!bg-green-600"
        >
          <Download size={18} /> Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 !bg-yellow-500 !text-white px-4 py-2 rounded hover:!bg-yellow-600"
        >
          <Printer size={18} /> Print
        </button>
        {order.status === "pending" && (
          <>
            <button
              onClick={handleConfirmPayment}
              className="flex items-center gap-2 !bg-blue-500 !text-white px-4 py-2 rounded hover:!bg-blue-600"
            >
              <CheckCircle size={18} /> Konfirmasi Pembayaran
            </button>
            <button
              onClick={handleCancelOrder}
              className="flex items-center gap-2 !bg-red-500 !text-white px-4 py-2 rounded hover:!bg-red-600"
            >
              <XCircle size={18} /> Batalkan Pesanan
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmationPage;
