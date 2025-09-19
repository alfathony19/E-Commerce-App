// src/pages/admin/ManagePromotionsPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { promoData } from "../../components/promo/promoData";

type Promotion = {
  id?: string;
  promoId: string;
  title: string;
  type: "voucher" | "banner" | "discount";
  voucherCode?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
};

const ManagePromotionsPage = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [form, setForm] = useState<Promotion>({
    promoId: "",
    title: "",
    type: "voucher",
    voucherCode: "",
    discountPercent: 0,
    startDate: "",
    endDate: "",
    status: "inactive",
  });

  // 🔥 Ambil data realtime dari Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Promos"), (snap) => {
      const data = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Promotion)
      );
      setPromos(data);
    });
    return () => unsub();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "discountPercent" ? Number(value) : (value as string | number),
    }));
  };

  const handleSave = async () => {
    try {
      const promoId = form.promoId || editingPromo?.id;
      if (!promoId) throw new Error("Promo ID wajib diisi");

      const ref = doc(db, "Promos", promoId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        // kalau ada → update field aja
        await updateDoc(ref, form);
      } else {
        // kalau nggak ada → bikin baru
        await setDoc(ref, {
          ...form,
          promoId, // simpan biar konsisten
        });
      }

      setOpenModal(false);
      setEditingPromo(null);
      setForm({
        promoId: "",
        title: "",
        type: "voucher",
        voucherCode: "",
        discountPercent: 0,
        startDate: "",
        endDate: "",
        status: "inactive",
      });
    } catch (err) {
      console.error("❌ Error saving promo:", err);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "promotions", id));
  };


  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">🎁 Kelola Promosi</h1>
      <p className="text-gray-600 mb-6">
        Tambah, ubah, dan kelola data promosi.
      </p>

      {/* Button tambah */}
      <div className="mb-4">
        <Button
          onClick={() => {
            setEditingPromo(null);
            setForm({
              promoId: "",
              title: "",
              type: "voucher",
              voucherCode: "",
              discountPercent: 0,
              startDate: "",
              endDate: "",
              status: "inactive",
            });
            setOpenModal(true);
          }}
        >
          + Tambah Promo
        </Button>
      </div>

      {/* Tabel Desktop */}
      <div className="hidden md:block !bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="!bg-cyan-100 text-left">
            <tr>
              <th className="p-3">Promo ID</th>
              <th className="p-3">Judul</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Kode Voucher</th> 
              <th className="p-3">Diskon</th>
              <th className="p-3">Periode</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.promoId}</td>
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.type}</td>
                <td className="p-3">{p.voucherCode || "-"}</td>
                <td className="p-3">{p.discountPercent}%</td>
                <td className="p-3">
                  {new Date(p.startDate).toLocaleDateString()} -{" "}
                  {new Date(p.endDate).toLocaleDateString()}
                </td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingPromo(p);
                      setForm(p);
                      setOpenModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(p.id)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card Mobile */}
      <div className="block lg:hidden space-y-4">
        {promos.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="font-bold">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.promoId}</p>
            <p className="text-sm">Jenis: {p.type}</p>
            <p className="text-sm">Kode Voucher: {p.voucherCode || "-"}</p>
            {/* 👈 baru */}
            <p className="text-sm">Diskon: {p.discountPercent}%</p>
            <p className="text-sm">
              Periode: {new Date(p.startDate).toLocaleDateString()}
              {new Date(p.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm">Status: {p.status}</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingPromo(p);
                  setForm(p);
                  setOpenModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(p.id)}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
            <Dialog.Title className="font-bold text-lg mb-4">
              {editingPromo ? "Edit Promo" : "Tambah Promo"}
            </Dialog.Title>

            <div className="space-y-3">
              <Input
                name="promoId"
                placeholder="Promo ID"
                value={form.promoId}
                onChange={handleChange}
              />
              <Select
                name="title"
                value={form.title}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Pilih dari promoData --" },
                  ...promoData.map((p) => ({
                    value: p.title,
                    label: `${p.title} (${p.discount})`,
                  })),
                ]}
              />
              <Input
                name="voucherCode"
                placeholder="Kode Voucher (opsional)"
                value={form.voucherCode}
                onChange={handleChange}
              />
              <Input
                name="discountPercent"
                type="number"
                placeholder="Diskon (%)"
                value={form.discountPercent}
                onChange={handleChange}
              />
              <Input
                name="startDate"
                type="date"
                value={form.startDate.split("T")[0]}
                onChange={handleChange}
              />
              <Input
                name="endDate"
                type="date"
                value={form.endDate.split("T")[0]}
                onChange={handleChange}
              />
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "expired", label: "Expired" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editingPromo ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ManagePromotionsPage;
