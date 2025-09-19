// src/components/upload/UploadAdminLogs.tsx
import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

type AdminLog = {
  logId: string;
  adminId: string;
  action: string;
  details: {
    orderId: string;
    oldStatus: string;
    newStatus: string;
  };
  timestamp: string;
};

const UploadAdminLogs = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setMessage("");
    try {
      // ambil dari public/data/logs/adminLogs.json
      const res = await fetch("/data/adminLogs.json");
      const data: AdminLog[] = await res.json();

      for (const log of data) {
        await setDoc(doc(collection(db, "adminLogs"), log.logId), log);
      }

      setMessage("Data Admin Logs berhasil diupload!");
    } catch (error) {
      console.error("Upload Admin Logs error:", error);
      setMessage("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Admin Logs</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk <code>adminLogs</code> ke Firestore.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-purple-600 !text-white rounded hover:!bg-purple-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Admin Logs"}
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
};

export default UploadAdminLogs;
