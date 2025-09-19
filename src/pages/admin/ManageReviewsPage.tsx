// src/pages/admin/ManageReviewsPage.tsx
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db} from "../../libs/firebase";
import { Dialog } from "@headlessui/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

type User = {
  id: string;
  email: string;
  fullName?: string;
};

type Rating = {
  user: string;
  bintang: number;
  komentar: string;
};

type Product = {
  id: string;
  nama: string;
  rating: Rating[];
  penilaian: number;
  __col?: string; // 🔥 simpan nama koleksi asal
};

const COLLECTIONS: string[] = [
  "ATK",
  "Banner",
  "Books-Agenda",
  "Brosur-Flyer",
  "Calendar",
  "Copy-and-Print",
  "Name-Card-Id",
  "Packaging",
  "Photos",
  "Sticker-Logo",
  "Undangan",
];

const ManageReviewsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingReview, setEditingReview] = useState<Rating | null>(null);
  const [form, setForm] = useState<Rating>({
    user: "",
    bintang: 5,
    komentar: "",
  });

  // 🔥 ambil data users realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          } as User)
      );
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // 🔥 ambil data dari semua koleksi
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    COLLECTIONS.forEach((colName) => {
      const unsub = onSnapshot(collection(db, colName), (snap) => {
        const data = snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              __col: colName, // biar tau produk ini asalnya dari koleksi mana
            } as Product & { __col: string })
        );

        setProducts((prev) => {
          // hapus produk lama dari koleksi yg sama biar gak double
          const filtered = prev.filter((p) => p.__col !== colName);
          return [...filtered, ...data];
        });
      });

      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

 const handleChange = (
   e: React.ChangeEvent<
     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
   >
 ) => {
   const { name, value } = e.target;
   setForm((prev) => ({
     ...prev,
     [name]: name === "bintang" ? Number(value) : value,
   }));
 };


  // hitung ulang average rating
  const recalcAverage = (rating: Rating[]) => {
    if (!rating.length) return 0;
    const sum = rating.reduce((acc, r) => acc + r.bintang, 0);
    return parseFloat((sum / rating.length).toFixed(1));
  };

  // 🔥 save ke koleksi yg bener
  const handleSave = async () => {
    if (!editingProduct) return;

    const { __col, id } = editingProduct;
    if (!__col) return; // safety

    const productRef = doc(db, __col, id);

    let newRating: Rating[];
    if (editingReview) {
      newRating = editingProduct.rating.map((r) =>
        r === editingReview ? form : r
      );
    } else {
      newRating = [...(editingProduct.rating || []), form];
    }

    await updateDoc(productRef, {
      rating: newRating,
      penilaian: recalcAverage(newRating),
    });

    setOpenModal(false);
    setEditingReview(null);
    setForm({ user: "", bintang: 5, komentar: "" });
  };

  const handleDelete = async (product: Product, review: Rating) => {
    if (!product.__col) return;

    const productRef = doc(db, product.__col, product.id);
    const newRating = product.rating.filter((r) => r !== review);

    await updateDoc(productRef, {
      rating: newRating,
      penilaian: recalcAverage(newRating),
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⭐ Kelola Review Produk</h1>
      <p className="!text-gray-600 mb-6">
        Lihat, tambahkan, dan kelola ulasan produk.
      </p>

      <div className="hidden md:block bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cyan-100 text-left">
            <tr>
              <th className="p-3">Produk</th>
              <th className="p-3">Review</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.nama}</td>
                <td className="p-3 space-y-2">
                  {p.rating?.length ? (
                    p.rating.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded p-2"
                      >
                        <div>
                          <p className="font-semibold">{r.user}</p>
                          <p className="text-gray-600 text-sm">{r.komentar}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <span className="text-yellow-500">
                            {"★".repeat(r.bintang)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingProduct(p);
                              setEditingReview(r);
                              setForm(r);
                              setOpenModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(p, r)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Belum ada review</p>
                  )}
                </td>
                <td className="p-3">{p.penilaian || 0} / 5</td>
                <td className="p-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProduct(p);
                      setEditingReview(null);
                      setForm({ user: "", bintang: 5, komentar: "" });
                      setOpenModal(true);
                    }}
                  >
                    Tambah Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Mobile View (Card) === */}
      <div className="block md:hidden space-y-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg p-4 space-y-3">
            <h2 className="font-bold">{p.nama}</h2>
            <div className="space-y-2">
              {p.rating?.length ? (
                p.rating.map((r, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 flex flex-col gap-2 bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{r.user}</p>
                      <p className="text-gray-600 text-sm">{r.komentar}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-sm">
                        {"★".repeat(r.bintang)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProduct(p);
                          setEditingReview(r);
                          setForm(r);
                          setOpenModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p, r)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Belum ada review</p>
              )}
            </div>
            <p className="text-sm font-medium">
              Rating: {p.penilaian || 0} / 5
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setEditingProduct(p);
                setEditingReview(null);
                setForm({ user: "", bintang: 5, komentar: "" });
                setOpenModal(true);
              }}
            >
              Tambah Review
            </Button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <div className="fixed inset-0 !bg-black/50 flex items-center justify-center">
          <Dialog.Panel className="!bg-white rounded-xl p-6 w-full max-w-md">
            <Dialog.Title className="font-bold text-lg mb-4">
              {editingReview ? "Edit Review" : "Tambah Review"}
            </Dialog.Title>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Pilih User</label>
              <Select
                name="user"
                value={form.user}
                onChange={handleChange}
                options={[
                  { value: "", label: "-- Pilih User --" },
                  ...users.map((u) => ({
                    value: u.email,
                    label: `${u.email} ${u.fullName ? `(${u.fullName})` : ""}`,
                  })),
                ]}
              />
              {/* Input manual untuk admin */}
              <label className="block text-sm font-medium">
                Atau Isi Manual
              </label>
              <Input
                name="user"
                placeholder="Nama / Email User"
                value={form.user}
                onChange={handleChange}
              />
              <Input
                name="bintang"
                type="number"
                min={1}
                max={5}
                placeholder="Rating (1-5)"
                value={form.bintang}
                onChange={handleChange}
              />
              <textarea
                name="komentar"
                placeholder="Komentar"
                value={form.komentar}
                onChange={handleChange}
                className="w-full border rounded p-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editingReview ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ManageReviewsPage;
