import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

// Rating per user
type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

// Spesifikasi khusus Brosur-Flyer
type SpesifikasiBrosur = {
  halaman?: number;
  kertas?: string;
  finishing?: string;
  [key: string]: string | number | undefined;
};

// Product Brosur-Flyer
type ProductBrosur = {
  id: string;
  category: "Brosur-Flyer";
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
  spesifikasi: SpesifikasiBrosur;
  deskripsi: string;
};

const UploadBrosurFlyer = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/Brosur-Flyer.json");
      const data: ProductBrosur[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Brosur-Flyer"), item.id), item);
      }

      setSuccess("Data Brosur-Flyer berhasil diupload!");
    } catch (error) {
      console.error("Upload Brosur-Flyer error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Brosur-Flyer</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Brosur-Flyer ke Firestore
        collection <code>Brosur-Flyer</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Brosur-Flyer"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadBrosurFlyer;
