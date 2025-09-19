import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

// Rating per user
type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

// Spesifikasi khusus Banner
type SpesifikasiBanner = {
  bahan?: string;
  jenis?: string;
  finishing?: string;
  [key: string]: string | undefined;
};

// Product Banner
type ProductBanner = {
  id: string;
  category: "Banner";
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
  spesifikasi: SpesifikasiBanner;
  deskripsi: string;
};

const UploadBanner = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/Banner.json");
      const data: ProductBanner[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Banner"), item.id), item);
      }

      setSuccess("Data Banner berhasil diupload!");
    } catch (error) {
      console.error("Upload Banner error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Banner</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Banner ke Firestore collection{" "}
        <code>Banner</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Banner"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadBanner;
