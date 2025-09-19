import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import type { Admin } from "../../types/admins";

const UploadAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      setLoading(true);
      setSuccess(null);

      // ambil file dari public/data/admins.json
      const response = await fetch("/data/admins.json");
      const data: Admin[] = await response.json();

      if (!Array.isArray(data)) {
        toast.error("Format JSON harus berupa array []");
        return;
      }

      for (const admin of data) {
        // cek kalau adminId ga ada, pakai auto id
        const adminId = admin.adminId || crypto.randomUUID();

        await setDoc(doc(collection(db, "admins"), adminId), {
          ...admin,
          adminId, // pastikan selalu ada adminId di firestore
        });
      }

      setSuccess("Admins berhasil diupload 🚀");
      toast.success("Admins uploaded!");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast.error(`Firebase error: ${error.code}`);
        console.error("Firebase error:", error.code, error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
        console.error("General error:", error.message);
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui");
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Admins</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk <code>admins</code> ke Firestore.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Admins"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadAdmins;
