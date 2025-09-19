// src/components/form/OrderForm.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { db } from "../../libs/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Combobox } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../../types/product";

const jasaDesign = [
  "Logo Design",
  "Poster / Banner",
  "Brosur / Flyer",
  "Undangan / Kartu Nama",
  "Konten Sosial Media",
];

const jasaCetak = ["Cetak Offset", "Digital Printing"];

const jasaFinishing = [
  "Laminating Doff",
  "Laminating Glossy",
  "Spot UV",
  "Hotprint Emas/Perak",
  "Emboss / Deboss",
  "Spiral / Hardcover Binding",
];

interface JenisKertas {
  id: string;
  nama: string;
  bahan: string;
  harga: number;
}

const OrderFormJasa = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 📦 State
  const [kategori, setKategori] = useState<
    "design" | "cetak" | "finishing" | ""
  >("");
  const [jasa, setJasa] = useState("");
  const [jenisKertas, setJenisKertas] = useState<JenisKertas[]>([]);
  const [jenis, setJenis] = useState<JenisKertas | null>(null);
  const [jumlah, setJumlah] = useState(1);
  const [designUrls, setDesignUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [revisi, setRevisi] = useState(1);
  const [selectedFinishing, setSelectedFinishing] = useState<string[]>([]);

  // 💰 Subtotal (sementara hitung basic aja)
  const subtotal =
    kategori === "cetak"
      ? (jenis?.harga ?? 0) * jumlah
      : kategori === "design"
      ? revisi * 50000 // contoh: tiap revisi Rp 50k
      : selectedFinishing.length * 10000; // contoh: tiap finishing Rp 10k

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
   if (!user?.uid) {
     alert("Harus login dulu!");
     return;
   }

   if (!kategori || !jasa) {
     alert("Lengkapi semua field!");
     return;
   }

   const id = generateOrderId();

   // hitung subtotal
   const subtotal = (jenis?.harga ?? 0) * jumlah;

   // bikin object cartItem
   const cartItem: CartItem = {
     id,
     nama: `${kategori.toUpperCase()} - ${jasa}`,
     harga: subtotal, // pastiin subtotal udah dihitung di atas
     cartQuantity: jumlah,
     imageUrl:
       designUrls.length > 0
         ? designUrls.map((url) => ({ imageUrl: url, alt: jasa }))
         : [{ imageUrl: "/images/default.png", alt: jasa }],
     isCustom: true,
     detail: {
       kategori: kategori as "design" | "cetak" | "finishing",
       jasa,
       // ⬇️ jangan kirim null
       bahan: jenis?.bahan ?? undefined,
       designUrls: designUrls.length ? designUrls : undefined,
       revisi: kategori === "design" ? revisi ?? 1 : undefined,
       finishing: kategori === "finishing" ? selectedFinishing : undefined,
       notes: notes || undefined,
     },
     selected: false,
   };


   try {
     // simpan ke state cart lokal
     addToCart(cartItem);

     // simpan ke firestore
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
      {/* Pilih Kategori */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Kategori Jasa</h3>
        <select
          className="border p-2 w-full rounded"
          value={kategori}
          onChange={(e) => {
            setKategori(e.target.value as any);
            setJasa("");
          }}
        >
          <option value="">-- Pilih Kategori --</option>
          <option value="design">Jasa Design</option>
          <option value="cetak">Jasa Cetak</option>
          <option value="finishing">Jasa Finishing</option>
        </select>
      </div>

      {/* Pilihan Jasa sesuai kategori */}
      {kategori && (
        <div>
          <h3 className="font-medium mb-3 text-lg pb-2">Jenis Jasa</h3>
          <select
            className="border p-2 w-full rounded"
            value={jasa}
            onChange={(e) => setJasa(e.target.value)}
          >
            <option value="">-- Pilih Jasa --</option>
            {kategori === "design" &&
              jasaDesign.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            {kategori === "cetak" &&
              jasaCetak.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            {kategori === "finishing" &&
              jasaFinishing.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Upload Design */}
      {kategori !== "" && (
        <div>
          <h3 className="font-medium mb-3 text-lg pb-2">
            Upload Design / Brief
          </h3>
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
                      setDesignUrls((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-1 right-1 !bg-red-500 !text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form spesifik Design */}
      {kategori === "design" && (
        <div>
          <h3 className="font-medium mb-3 text-lg pb-2">Jumlah Revisi</h3>
          <input
            type="number"
            min={1}
            value={revisi}
            onChange={(e) => setRevisi(Number(e.target.value))}
            className="border p-2 w-full rounded"
          />
        </div>
      )}

      {/* Form spesifik Cetak */}
      {kategori === "cetak" && (
        <>
          {/* Jenis Kertas */}
          <div>
            <h3 className="font-medium mb-3 text-lg pb-2">Jenis Kertas</h3>
            <Combobox value={jenis} onChange={setJenis}>
              <Combobox.Input
                className="border p-2 w-full rounded"
                displayValue={(k: JenisKertas) =>
                  k
                    ? `${k.nama} | ${k.bahan} | Rp ${k.harga.toLocaleString()}`
                    : ""
                }
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari jenis kertas..."
              />
              <Combobox.Options className="border mt-1 max-h-60 overflow-auto rounded !bg-white shadow">
                {filteredJenisKertas.length === 0 && (
                  <div className="px-3 py-2 !text-gray-500">
                    Tidak ada hasil
                  </div>
                )}
                {filteredJenisKertas.map((k) => (
                  <Combobox.Option
                    key={k.id}
                    value={k}
                    className={({ active }) =>
                      `cursor-pointer px-3 py-2 ${
                        active
                          ? "!bg-blue-500 !text-white"
                          : "!bg-white !text-black"
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
        </>
      )}

      {/* Form spesifik Finishing */}
      {kategori === "finishing" && (
        <div>
          <h3 className="font-medium mb-3 text-lg pb-2">Pilih Finishing</h3>
          <div className="flex flex-col gap-2">
            {jasaFinishing.map((f) => (
              <label key={f} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={f}
                  checked={selectedFinishing.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFinishing((prev) => [...prev, f]);
                    } else {
                      setSelectedFinishing((prev) =>
                        prev.filter((x) => x !== f)
                      );
                    }
                  }}
                />
                {f}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h3 className="font-medium mb-3 text-lg pb-2">Catatan Tambahan</h3>
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Tulis request khusus di sini..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
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

export default OrderFormJasa;
