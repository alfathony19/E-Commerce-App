// src/components/UploadPromo.tsx
import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

type PromoType = "banner" | "voucher" | "auto_discount";

type Promo = {
  promoId: string;
  title: string;
  type: PromoType;
  voucherCode?: string; // khusus kalau type = "voucher"
  discountPercent?: number; // kalau voucher/auto_discount
  bannerUrl?: string; // kalau type = "banner"
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
};

const UploadPromo = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/promo-data.json"); // simpen json di public/data/promos/Promos.json
      const data: Promo[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Promos"), item.promoId), item);
      }

      setSuccess("Data promo berhasil diupload!");
    } catch (error) {
      console.error("Upload Promo error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Promo</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Promo ke Firestore collection{" "}
        <code>Promos</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-green-600 !text-white rounded hover:!bg-green-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Promo"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadPromo;
