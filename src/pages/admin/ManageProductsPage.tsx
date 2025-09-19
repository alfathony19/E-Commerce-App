import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import type {
  Product,
  FirestoreProduct,
  ProductImageSet,
} from "../../types/product";
import { Dialog } from "@headlessui/react";

type UnitOption = {
  label: string;
  multiplier: number;
};

const COLLECTIONS = [
  "ATK",
  "Banner",
  "Brosur-Flyer",
  "Copy-and-Print",
  "Name-Card-Id",
  "Packaging",
  "Photos",
  "Sticker-Logo",
  "Undangan",
  "Calendar",
  "Books-Agenda",
];

const ManageProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search
  const [history, setHistory] = useState<string[]>([]);

  // ✅ Load products
  const loadProducts = async () => {
    setLoading(true);
    let all: Product[] = [];

    for (const col of COLLECTIONS) {
      const snap = await getDocs(collection(db, col));
      const mapped = snap.docs.map((d) => {
        const data = d.data() as FirestoreProduct;
        return {
          id: d.id,
          category: col,
          nama: data.nama || data.name || "Tanpa Nama",
          deskripsi: data.deskripsi || data.description || "",
          harga: data.harga ?? data.price ?? 0,
          hargaPromo: data.harga_promo ?? data.promoPrice ?? null,
          hargaBelanja: data.hargaBelanja ?? 0,
          quantity: data.quantity ?? 0,
          satuan: data.satuan ?? "pcs",
          status: data.status ?? "active",
          is_recommended: data.is_recommended ?? false,
          penilaian: data.penilaian ?? 0,
          rating: data.rating ?? [],
          label: data.label ?? "",
          pengerjaan: data.pengerjaan ?? "",
          warna: data.warna ?? [],
          unitOptions: data.unitOptions ?? [],
          spesifikasi: data.spesifikasi ?? {},
          imageUrl: Array.isArray(data.imageUrl)
            ? (data.imageUrl as ProductImageSet[])
            : [
                {
                  imageUrl:
                    (data.imageUrl as string | undefined) ?? "/no-image.png",
                },
              ],
        } as Product;
      });
      all = [...all, ...mapped];
    }

    setProducts(all);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ Load history dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("product_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // ✅ Simpan history setiap kali berubah
  useEffect(() => {
    localStorage.setItem("product_history", JSON.stringify(history));
  }, [history]);

  const uploadToImgbb = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=b8e7c3098b5d082ffab864e87e12d256`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data.data.url as string; // link hasil upload
    } catch (err) {
      console.error("Upload gagal:", err);
      return null;
    }
  };

  // ✅ Save (add/update)
  const handleSave = async () => {
    if (!form.category) {
      alert("Pilih kategori atau ketik kategori baru!");
      return;
    }

    if (editing) {
      const cleanedForm = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, form.category, editing.id), cleanedForm);
      setHistory((prev) => [
        `✏️ Edit produk ${form.nama} (${
          form.category
        }) - ${new Date().toLocaleString()}`,
        ...prev,
      ]);
    } else {
      const prefix = form.category.substring(0, 3).toUpperCase();
      const categoryProducts = products.filter(
        (p) => p.category === form.category
      );
      const lastNumber =
        categoryProducts.length > 0
          ? Math.max(
              ...categoryProducts
                .map((p) => parseInt(p.id?.replace(prefix, "") || "0"))
                .filter((n) => !isNaN(n))
            )
          : 0;

      const nextNumber = String(lastNumber + 1).padStart(3, "0");
      const customId = `${prefix}${nextNumber}`;

      await setDoc(doc(db, form.category, customId), {
        ...form,
        id: customId,
        category: form.category,
        harga_belanja: form.hargaBelanja ?? 0,
        harga_promo: form.hargaPromo ?? null,
      });

      setHistory((prev) => [
        `➕ Tambah produk ${form.nama} (${
          form.category
        }) - ${new Date().toLocaleString()}`,
        ...prev,
      ]);
    }

    setModalOpen(false);
    setForm({});
    setEditing(null);
    loadProducts();
  };

  const handleDelete = async (p: Product) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    await deleteDoc(doc(db, p.category, p.id));

    setHistory((prev) => [
      `🗑️ Hapus produk ${p.nama} (${
        p.category
      }) - ${new Date().toLocaleString()}`,
      ...prev,
    ]);

    loadProducts();
  };

  // ✅ Filter products sesuai search
  const filteredProducts = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">🛒 Kelola Produk</h1>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="text"
          placeholder="🔍 Cari produk..."
          className="border rounded px-3 py-2 flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="button"
          className="px-3 py-2 rounded-lg !bg-green-600 !text-white shadow hover:!bg-green-700 transition"
          onClick={() => {
            setForm({});
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Tambah Produk
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* 🖥️ Desktop Tabel */}
          <div className="hidden md:block overflow-hidden rounded-lg shadow border border-gray-200 mt-4">
            <table className="min-w-full text-sm">
              <thead className="!bg-blue-600 !text-white text-left">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Harga Jual</th>
                  <th className="p-3">Harga Promo</th>
                  <th className="p-3">Harga Belanja</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="!bg-white">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:!bg-gray-50 transition"
                  >
                    <td className="p-3 flex items-center gap-2">
                      <img
                        src={
                          (p.imageUrl[0]?.imageUrl as string) ||
                          p.imageUrl[0]?.image1 ||
                          "/no-image.png"
                        }
                        alt={p.nama}
                        className="w-12 h-12 object-cover rounded"
                      />
                      {p.nama}
                    </td>
                    <td className="p-3">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-green-600 font-semibold">
                      {p.hargaPromo
                        ? `Rp ${p.hargaPromo.toLocaleString("id-ID")}`
                        : "-"}
                    </td>
                    <td className="p-3 text-red-600">
                      Rp {(p.hargaBelanja ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3">{p.quantity}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3 capitalize">{p.status}</td>
                    <td className="p-3 space-x-2">
                      <button
                        type="button"
                        className="px-3 py-1 rounded !bg-blue-600 !text-white hover:!bg-blue-700"
                        onClick={() => {
                          setForm(p);
                          setEditing(p);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded !bg-red-600 !text-white hover:!bg-red-700"
                        onClick={() => handleDelete(p)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 Mobile Card List */}
          <div className="md:hidden space-y-4 mt-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white shadow rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={
                      (p.imageUrl[0]?.imageUrl as string) ||
                      p.imageUrl[0]?.image1 ||
                      "/no-image.png"
                    }
                    alt={p.nama}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <div className="font-semibold">{p.nama}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                  </div>
                </div>
                <div className="text-sm mt-1">
                  <div>
                    Harga Jual:{" "}
                    <span className="font-semibold">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div>
                    Harga Promo:{" "}
                    {p.hargaPromo ? (
                      <span className="text-green-600 font-semibold">
                        Rp {p.hargaPromo.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div>
                    Harga Belanja:{" "}
                    <span className="text-red-600">
                      Rp {(p.hargaBelanja ?? 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Stok: {p.quantity}</div>
                <div className="text-xs capitalize text-gray-500">
                  Status: {p.status}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className="flex-1 px-3 py-1 rounded !bg-blue-600 !text-white hover:!bg-blue-700"
                    onClick={() => {
                      setForm(p);
                      setEditing(p);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-3 py-1 rounded !bg-red-600 !text-white hover:!bg-red-700"
                    onClick={() => handleDelete(p)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* History log */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">📜 Riwayat Aktivitas</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada aktivitas.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="font-bold text-lg mb-4">
              {editing ? "Edit Produk" : "Tambah Produk"}
            </Dialog.Title>

            {/* FORM FULL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Kategori */}
              <input
                className="border p-2 rounded"
                placeholder="Kategori (misal: Calendar)"
                list="categories"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <datalist id="categories">
                <option value="ATK" />
                <option value="Banner" />
                <option value="Brosur-Flyer" />
                <option value="Books-Agenda" />
                <option value="Calendar" />
                <option value="Name-Card-Id" />
                <option value="Packaging" />
                <option value="Photos" />
                <option value="Sticker-Logo" />
                <option value="Undangan" />
              </datalist>

              {/* Nama */}
              <input
                className="border p-2 col-span-2 rounded"
                placeholder="Nama"
                value={form.nama || ""}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
              {/* Harga */}
              <input
                className="border p-2 rounded"
                placeholder="Harga"
                type="number"
                value={form.harga || ""}
                onChange={(e) =>
                  setForm({ ...form, harga: Number(e.target.value) })
                }
              />
              {/* Harga Belanja (Modal) */}
              <input
                className="border p-2 rounded"
                placeholder="Harga Belanja (modal)"
                type="number"
                value={form.hargaBelanja || ""}
                onChange={(e) =>
                  setForm({ ...form, hargaBelanja: Number(e.target.value) })
                }
              />

              {/* Harga Promo */}
              <input
                className="border p-2 rounded"
                placeholder="Harga Promo"
                type="number"
                value={form.hargaPromo || ""}
                onChange={(e) =>
                  setForm({ ...form, hargaPromo: Number(e.target.value) })
                }
              />
              {/* Stok */}
              <input
                className="border p-2 rounded"
                placeholder="Stok"
                type="number"
                value={form.quantity || ""}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
              {/* Satuan */}
              <select
                className="border p-2 rounded"
                value={form.satuan || ""}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              >
                <option value="pcs">pcs</option>
                <option value="lembar">lembar</option>
                <option value="roll">roll</option>
                <option value="lusin">lusin</option>
                <option value="rim">rim</option>
                <option value="pack">pack</option>
                <option value="box">box</option>
              </select>
              {/* Status */}
              <select
                className="border p-2 rounded"
                value={form.status || ""}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="out_of_stock">Habis</option>
              </select>

              {/* Deskripsi */}
              <textarea
                className="border p-2 col-span-2 rounded"
                placeholder="Deskripsi"
                value={form.deskripsi || ""}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
              />
              {/* Label */}
              <input
                className="border p-2 col-span-2 rounded"
                placeholder="Label"
                value={form.label || ""}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              {/* Pengerjaan */}
              <input
                className="border p-2 col-span-2 rounded"
                placeholder="Pengerjaan"
                value={form.pengerjaan || ""}
                onChange={(e) =>
                  setForm({ ...form, pengerjaan: e.target.value })
                }
              />

              {/* Warna */}
              <div className="col-span-2">
                <label className="text-sm font-semibold">Warna</label>
                {(form.warna || []).map((w, i) => (
                  <div key={i} className="flex gap-2 mt-1">
                    <input
                      className="border p-2 flex-1 rounded"
                      value={w}
                      onChange={(e) => {
                        const newWarna = [...(form.warna || [])];
                        newWarna[i] = e.target.value;
                        setForm({ ...form, warna: newWarna });
                      }}
                    />
                    <button
                      type="button"
                      className="!bg-red-500 !text-white px-2 rounded"
                      onClick={() => {
                        setForm({
                          ...form,
                          warna: (form.warna || []).filter(
                            (_, idx) => idx !== i
                          ),
                        });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 px-2 py-1 !bg-gray-200 rounded"
                  onClick={() =>
                    setForm({ ...form, warna: [...(form.warna || []), ""] })
                  }
                >
                  + Tambah Warna
                </button>
              </div>

              {/* Unit Options */}
              <div className="col-span-2">
                <label className="text-sm font-semibold">Unit Options</label>
                {((form.unitOptions as UnitOption[]) || []).map((u, i) => (
                  <div key={i} className="flex gap-2 mt-1">
                    <input
                      className="border p-2 flex-1 rounded"
                      placeholder="Label"
                      value={u.label}
                      onChange={(e) => {
                        const newUnits = [
                          ...(form.unitOptions as UnitOption[]),
                        ];
                        newUnits[i].label = e.target.value;
                        setForm({ ...form, unitOptions: newUnits });
                      }}
                    />
                    <input
                      className="border p-2 w-24 rounded"
                      placeholder="Multiplier"
                      type="number"
                      value={u.multiplier}
                      onChange={(e) => {
                        const newUnits = [
                          ...(form.unitOptions as UnitOption[]),
                        ];
                        newUnits[i].multiplier = Number(e.target.value);
                        setForm({ ...form, unitOptions: newUnits });
                      }}
                    />
                    <button
                      type="button"
                      className="!bg-red-500 !text-white px-2 rounded"
                      onClick={() => {
                        setForm({
                          ...form,
                          unitOptions: (form.unitOptions || []).filter(
                            (_, idx) => idx !== i
                          ),
                        });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 px-2 py-1 !bg-gray-200 rounded"
                  onClick={() =>
                    setForm({
                      ...form,
                      unitOptions: [
                        ...(form.unitOptions || []),
                        { label: "", multiplier: 1 },
                      ],
                    })
                  }
                >
                  + Tambah Unit
                </button>
              </div>

              {/* Images */}
              <div className="col-span-2">
                <label className="text-sm font-semibold">Gambar</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                  {(form.imageUrl || []).map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img.imageUrl || "/no-image.png"}
                        alt="preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded border"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0.5 w-5 h-5 flex items-center justify-center 
                      rounded-full !bg-red-600 !text-white text-xs opacity-80 hover:opacity-100"
                        onClick={() => {
                          setForm({
                            ...form,
                            imageUrl: (form.imageUrl || []).filter(
                              (_, idx) => idx !== i
                            ),
                          });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-2"
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);

                    // preview lokal
                    const tempUrls = files.map((f) => ({
                      imageUrl: URL.createObjectURL(f),
                    }));
                    setForm({
                      ...form,
                      imageUrl: [...(form.imageUrl || []), ...tempUrls],
                    });

                    // upload ke imgbb
                    const uploadedUrls: { imageUrl: string }[] = [];
                    for (const file of files) {
                      const url = await uploadToImgbb(file);
                      if (url) uploadedUrls.push({ imageUrl: url });
                    }

                    // replace preview lokal dengan link asli
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: [
                        ...(prev.imageUrl || []).filter(
                          (img) => !img.imageUrl.startsWith("blob:")
                        ),
                        ...uploadedUrls,
                      ],
                    }));
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                className="px-3 py-1 !bg-gray-200 rounded hover:!bg-gray-300"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="px-3 py-1 !bg-green-600 !text-white rounded hover:!bg-green-700"
                onClick={handleSave}
              >
                Simpan
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </div>
  );
};

export default ManageProductsPage;
