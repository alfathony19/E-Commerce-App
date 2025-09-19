// src/components/upload/UploadStatsSummary.tsx
import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

type StatsSummary = {
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeProducts: number;
  inactiveProducts: number;
  lastUpdated: string;
};

const UploadStatsSummary = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/stats-summary.json");
      const data: StatsSummary[] = await res.json();

      for (const item of data) {
        // Pakai doc id auto (misalnya timestamp)
        const docId = new Date(item.lastUpdated).getTime().toString();
        await setDoc(doc(collection(db, "stats-summary"), docId), item);
      }

      setSuccess("Data Stats Summary berhasil diupload!");
    } catch (error) {
      console.error("Upload Stats Summary error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Stats Summary</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk <code>stats-summary</code> ke Firestore.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Stats Summary"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadStatsSummary;
