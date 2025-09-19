import { useState } from "react";
import { db } from "../../libs/firebase";
import { collection, setDoc, doc } from "firebase/firestore";

type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

type SpesifikasiNameCard = {
  kertas: string;
  finishing: string;
  jenis: string;
  [key: string]: string | number | undefined;
};

type ProductNameCard = {
  id: string;
  category: "Name-Card-Id";
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
  spesifikasi: SpesifikasiNameCard;
  deskripsi: string;
};

const UploadNameCardId = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/data/products/Name-Card-Id.json");
      const data: ProductNameCard[] = await res.json();

      for (const item of data) {
        await setDoc(doc(collection(db, "Name-Card-Id"), item.id), item);
      }

      setSuccess("Data Name-Card-Id berhasil diupload!");
    } catch (error) {
      console.error("Upload Name-Card-Id error:", error);
      setSuccess("Terjadi error saat upload!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">Upload Data Name-Card-Id</h2>
      <p className="text-gray-600 mb-4">
        Upload file JSON sample untuk kategori Name-Card-Id ke Firestore
        collection <code>Name-Card-Id</code>.
      </p>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 !bg-blue-600 !text-white rounded hover:!bg-blue-700 !disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Submit Name-Card-Id"}
      </button>
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default UploadNameCardId;
