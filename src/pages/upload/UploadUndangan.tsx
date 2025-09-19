import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

type SpesifikasiUndangan = {
  jenis: string;
  kertas: string;
  finishing?: string;
  [key: string]: string | number | undefined;
};

type ProductUndangan = {
  id: string;
  category: "Undangan";
  nama: string;
  rating: Rating[];
  penilaian: number;
  gambar: string[];
  label: string;
  pengerjaan: string;
  warna: string[];
  quantity: number;
  satuan: "pcs" | "rim" | "lembar" | "roll" | "lusin";
  ukuran?: string;
  harga: number;
  harga_promo: number;
  status: "active" | "inactive" | "out_of_stock";
  is_recommended: boolean;
  spesifikasi: SpesifikasiUndangan;
  deskripsi: string;
};

const UploadUndangan = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/Undangan.json");
      const data: ProductUndangan[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Undangan"), item.id), item);
      }

      setSuccess("Data Undangan berhasil diupload!");
    } catch (error) {
      console.error("Upload Undangan error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Undangan</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Undangan ke Firestore collection{" "}
        <code>Undangan</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Undangan"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadUndangan;
