// src/components/form/OrderForm.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { db } from "../../libs/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Combobox } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const jasaCetak = [
  "Cetak Offset",
  "Digital Printing",
];

interface JenisKertas {
  id: string;
  nama: string;
  bahan: string;
  harga: number;
}

const OrderForm = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 📦 State
  const [jasa, setJasa] = useState("");
  const [jenisKertas, setJenisKertas] = useState<JenisKertas[]>([]);
  const [jenis, setJenis] = useState<JenisKertas | null>(null);
  const [jumlah, setJumlah] = useState(1);
  const [designUrls, setDesignUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");

  // 💰 Subtotal
  const subtotal = (jenis?.harga ?? 0) * jumlah;

  // 🔑 Generate custom ID
  const generateOrderId = () => {
    const now = new Date();
    const tgl = now.toLocaleDateString("id-ID").replace(/\//g, "");
    const uniq = Math.random().toString(36).substring(2, 6);
    return `SRV-${tgl}-${uniq}`;
  };

  // 📤 Upload design ke imgbb
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + designUrls.length > 5) {
      alert("Maksimal 5 file design.");
      return;
    }

    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          { method: "POST", body: formData }
        );
        const data = await res.json();

        if (data.success) {
          setDesignUrls((prev) => [...prev, data.data.url]);
        }
      } catch (error) {
        console.error("Error upload:", error);
      }
    }
  };

  // 🚀 Tambah ke Cart
  const handleAddToCart = async () => {
    if (!user) {
      alert("Harus login dulu!");
      return;
    }
    if (!jasa || !jenis) {
      alert("Lengkapi semua field!");
      return;
    }

    const id = generateOrderId();

    const cartItem = {
      id,
      nama: `${jasa} - ${jenis.nama}`,
      harga: jenis.harga,
      cartQuantity: jumlah,
      imageUrl:
        designUrls.length > 0
          ? designUrls.map((url) => ({
              imageUrl: url,
              alt: `${jasa} - ${jenis.nama}`,
            }))
          : [
              {
                imageUrl: "/images/default.png",
                alt: `${jasa} - ${jenis.nama}`,
              },
            ],
      isCustom: true,
      detail: {
        jasa,
        bahan: jenis.bahan,
        designUrls,
        notes,
      },
      selected: false,
    };

    try {
      // 1. Simpan ke state lokal
      addToCart(cartItem);

      // 2. Simpan ke Firestore
      const cartRef = doc(db, "users", user.uid, "cart", id);
      await setDoc(cartRef, cartItem);

      alert("Produk berhasil ditambahkan ke keranjang!");
      navigate("/user/cart");
    } catch (err) {
      console.error("Gagal tambah cart:", err);
      alert("Gagal menambahkan produk ke cart.");
    }
  };

  // 📥 Load JSON jenis kertas
  useEffect(() => {
    fetch("/data/daftar_harga_full.json")
      .then((res) => res.json())
      .then((data: JenisKertas[]) => {
        setJenisKertas(data);
        setJenis(data[0]);
      })
      .catch((err) => console.error("Gagal load JSON:", err));
  }, []);

  const filteredJenisKertas =
    query === ""
      ? jenisKertas
      : jenisKertas.filter(
          (k) =>
            k.nama.toLowerCase().includes(query.toLowerCase()) ||
            k.bahan.toLowerCase().includes(query.toLowerCase()) ||
            k.harga.toString().includes(query)
        );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className="p-6 space-y-6 bg-white shadow rounded"
    >
      {/* Jasa Cetak */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Jasa Cetak</h3>
        <select
          className="border p-2 w-full rounded"
          value={jasa}
          onChange={(e) => setJasa(e.target.value)}
        >
          <option value="">-- Pilih Jasa --</option>
          {jasaCetak.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Design */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Upload Design</h3>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUploadImage}
        />

        {/* Preview */}
        {designUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {designUrls.map((url, i) => (
              <div key={i} className="relative border rounded p-1 group">
                <img
                  src={url}
                  alt={`Design ${i + 1}`}
                  className="w-full h-auto rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDesignUrls((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 !bg-red-500 !text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input manual link */}
        <div className="flex gap-2 mt-3">
          <input
            className="border p-2 w-full rounded"
            placeholder="Atau masukkan link design"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val !== "") {
                  setDesignUrls((prev) => [...prev, val]);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
        </div>
      </div>

      {/* Jenis Kertas */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Jenis Kertas</h3>
        <Combobox value={jenis} onChange={setJenis}>
          <Combobox.Input
            className="border p-2 w-full rounded"
            displayValue={(k: JenisKertas) =>
              k ? `${k.nama} | ${k.bahan} | Rp ${k.harga.toLocaleString()}` : ""
            }
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jenis kertas..."
          />
          <Combobox.Options className="border mt-1 max-h-60 overflow-auto rounded !bg-white shadow">
            {filteredJenisKertas.length === 0 && (
              <div className="px-3 py-2 !text-gray-500">Tidak ada hasil</div>
            )}
            {filteredJenisKertas.map((k) => (
              <Combobox.Option
                key={k.id}
                value={k}
                className={({ active }) =>
                  `cursor-pointer px-3 py-2 ${
                    active ? "!bg-blue-500 !text-white" : "!bg-white !text-black"
                  }`
                }
              >
                {k.nama} | {k.bahan} | Rp {k.harga.toLocaleString()}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </div>

      {/* Jumlah */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Jumlah</h3>
        <input
          type="number"
          min={1}
          className="border p-2 w-full rounded"
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
        />
      </div>

      {/* Notes */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Catatan Tambahan</h3>
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Tulis request khusus di sini..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* ⚠️ Warning untuk percetakan */}
        <p className="mt-2 text-sm !text-red-600 !bg-red-50 border !border-red-200 p-2 rounded">
          ⚠️ Pastikan kembali file design sudah <strong>final</strong> dan sesuai dengan
          isi konten, tata letak (layout), ukuran, warna, dan resolusi sebelum
          proses cetak. Kesalahan pada file design sepenuhnya bukan tanggung
          jawab kami.
        </p>
      </div>

      {/* Total */}
      <div>
        <h3 className="font-medium mb-3 text-lg border-b pb-2">
          Total Pesanan
        </h3>
        <p className="font-bold">Total: Rp {subtotal.toLocaleString()}</p>
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full !bg-red-500 !text-white py-2 rounded-lg hover:!bg-red-600"
      >
        Tambah ke Keranjang
      </button>
    </form>
  );
};

export default OrderForm;
