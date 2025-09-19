import { useState } from "react";
import { db } from "../../libs/firebase"; // pastikan config firebase sudah benar
import { collection, setDoc, doc } from "firebase/firestore";

// Rating per user
type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

// Spesifikasi umum untuk produk ATK
type SpesifikasiATK = {
  jenis?: string;
  ukuran?: string;
  bahan?: string;
  isi?: string | number;
  lembar?: number;
  gramasi?: string;
  kapasitas?: string | number;
  [key: string]: string | number | undefined;
};

// Tipe Product khusus ATK
type Product = {
  id: string;
  category: "ATK";
  nama: string;
  rating: Rating[];
  penilaian: number;
  gambar: string[];
  label: string;
  pengerjaan: string;
  warna: string[];
  quantity: number;
  satuan: "pcs" | "pack" | "unit" | "lembar" | "roll" | "lusin";
  ukuran?: string;
  harga: number;
  harga_promo: number;
  status: "active" | "inactive" | "out_of_stock";
  is_recommended: boolean;
  spesifikasi: SpesifikasiATK;
  deskripsi: string;
};

const UploadATK = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/ATK.json");
      const data: Product[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "ATK"), item.id), item);
      }

      setSuccess("Data ATK berhasil diupload!");
    } catch (error) {
      console.error("Upload ATK error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data ATK</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori ATK ke Firestore collection{" "}
        <code>ATK</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white !rounded hover:bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit ATK"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadATK;
