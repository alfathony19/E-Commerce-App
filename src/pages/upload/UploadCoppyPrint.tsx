import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

// Rating per user
type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

// Spesifikasi khusus Coppy-and-Print
type SpesifikasiCopyPrint = {
  kertas?: string;
  jenis?: string;
  warna?: string;
  ukuran?: string;
  [key: string]: string | number | undefined;
};

// Product Coppy-and-Print
type ProductCopyPrint = {
  id: string;
  category: "Coppy-and-Print";
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
  spesifikasi: SpesifikasiCopyPrint;
  deskripsi: string;
};

const UploadCoppyPrint = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/Coppy-and-Print.json");
      const data: ProductCopyPrint[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Coppy-and-Print"), item.id), item);
      }

      setSuccess("Data Coppy-and-Print berhasil diupload!");
    } catch (error) {
      console.error("Upload Coppy-and-Print error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">
        Upload Data Coppy-and-Print
      </h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Coppy-and-Print ke Firestore
        collection <code>Coppy-and-Print</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Coppy-and-Print"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadCoppyPrint;
