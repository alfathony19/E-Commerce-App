// src/pages/admin/ManageUsersPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updatePassword,
} from "firebase/auth";
import { FiImage } from "react-icons/fi";
import { db, auth } from "../../libs/firebase";
import { Button } from "../../components/ui/button";
import { Dialog } from "@headlessui/react";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { validatePassword } from "../../utils/validatePassword";

const ManageUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    email: "",
    password: "",
    role: "customer",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    photoUrl: "", // 🔹 baru
  });

  // ambil data realtime dari Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!editingUser) {
        // CREATE
        if (!validatePassword(form.password)) {
          alert(
            "Password tidak valid! Minimal 8 karakter, ada huruf besar, angka, dan simbol."
          );
          return;
        }

        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

        await addDoc(collection(db, "users"), {
          uid: cred.user.uid,
          email: form.email,
          role: form.role,
          profile: {
            fullName: form.fullName,
            phone: form.phone,
            photoUrl: form.photoUrl || "", // 🔹 simpan photoUrl
            address: {
              street: form.street,
              city: form.city,
              province: form.province,
              postalCode: form.postalCode,
              country: form.country,
            },
          },
          wishlist: [],
          cart: [],
          createdAt: new Date().toISOString(),
        });
      } else {
        // UPDATE
        await updateDoc(doc(db, "users", editingUser.id), {
          email: form.email,
          role: form.role,
          profile: {
            fullName: form.fullName,
            phone: form.phone,
            photoUrl: form.photoUrl || "", // 🔹 update photoUrl
            address: {
              street: form.street,
              city: form.city,
              province: form.province,
              postalCode: form.postalCode,
              country: form.country,
            },
          },
        });

        if (form.password && form.password.trim() !== "") {
          if (!validatePassword(form.password)) {
            alert(
              "Password tidak valid! Minimal 8 karakter, ada huruf besar, angka, dan simbol."
            );
            return;
          }
          if (editingUser.uid) {
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid === editingUser.uid) {
              await updatePassword(currentUser, form.password);
            } else {
              console.warn(
                "Password hanya bisa diubah untuk user yang sedang login."
              );
            }
          }
        }
      }

      // reset form
      setOpenModal(false);
      setEditingUser(null);
      setForm({
        email: "",
        password: "",
        role: "customer",
        fullName: "",
        phone: "",
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
        photoUrl: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Hapus user ${user.email}?`)) return;
    await deleteDoc(doc(db, "users", user.id));
    if (user.uid) {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === user.uid) {
          await deleteUser(currentUser);
        }
      } catch (err) {
        console.error("Gagal hapus user Auth:", err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            👥Kelola Users
          </h1>
          <p className="!text-gray-600">Kelola akun pelanggan dan admin.</p>
        </div>
        <Button onClick={() => setOpenModal(true)}>+ Tambah User</Button>
      </div>

      {/* 🖥️ Tabel Desktop */}
      <div className="hidden md:block !bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="!bg-cyan-100 text-left">
            <tr>
              <th className="p-3">Foto</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Telp</th>
              <th className="p-3">Alamat</th>
              <th className="p-3">Wishlist</th>
              <th className="p-3">Cart</th>
              <th className="p-3">Dibuat</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:!bg-gray-50">
                <td className="p-3">
                  {u.profile?.photoUrl ? (
                    <img
                      src={u.profile.photoUrl}
                      alt="foto profil"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.profile?.fullName}</td>
                <td className="p-3">{u.profile?.phone}</td>
                <td className="p-3 text-xs">
                  {u.profile?.address?.street}, {u.profile?.address?.city},{" "}
                  {u.profile?.address?.province}
                </td>
                <td className="p-3">{u.wishlist?.length || 0}</td>
                <td className="p-3">{u.cart?.length || 0}</td>
                <td className="p-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingUser(u);
                      setForm({
                        ...form,
                        email: u.email,
                        role: u.role,
                        fullName: u.profile?.fullName || "",
                        phone: u.profile?.phone || "",
                        street: u.profile?.address?.street || "",
                        city: u.profile?.address?.city || "",
                        province: u.profile?.address?.province || "",
                        postalCode: u.profile?.address?.postalCode || "",
                        country: u.profile?.address?.country || "",
                        photoUrl: u.profile?.photoUrl || "",
                        password: "",
                      });
                      setOpenModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(u)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Card */}
      <div className="md:hidden space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="!bg-white shadow rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              {u.profile?.photoUrl ? (
                <img
                  src={u.profile.photoUrl}
                  alt="foto profil"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 !bg-gray-200 rounded-full" />
              )}
              <div>
                <div className="text-sm font-medium">{u.email}</div>
                <div className="text-xs !text-gray-500">
                  {u.profile?.fullName} • {u.role}
                </div>
              </div>
            </div>
            <div className="text-xs">{u.profile?.phone}</div>
            <div className="text-xs !text-gray-500">
              {u.profile?.address?.city}, {u.profile?.address?.province}
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>Wishlist: {u.wishlist?.length || 0}</span>
              <span>Cart: {u.cart?.length || 0}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingUser(u);
                  setForm({
                    ...form,
                    email: u.email,
                    role: u.role,
                    fullName: u.profile?.fullName || "",
                    phone: u.profile?.phone || "",
                    street: u.profile?.address?.street || "",
                    city: u.profile?.address?.city || "",
                    province: u.profile?.address?.province || "",
                    postalCode: u.profile?.address?.postalCode || "",
                    country: u.profile?.address?.country || "",
                    photoUrl: u.profile?.photoUrl || "",
                    password: "",
                  });
                  setOpenModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(u)}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <div className="fixed inset-0 !bg-black/50 flex items-center justify-center">
          <Dialog.Panel className="!bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <Dialog.Title className="font-bold text-lg mb-4">
              {editingUser ? "Edit User" : "Tambah User"}
            </Dialog.Title>

            <div className="space-y-3">
              <div className="flex flex-col items-center gap-3 mt-3">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Foto Profil"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center rounded-full !bg-gray-100 border">
                    <FiImage className="text-3xl !text-gray-400" />
                  </div>
                )}

                {/* Input Link Manual */}
                <Input
                  name="photoUrl"
                  placeholder="Link Foto Profil"
                  value={form.photoUrl}
                  onChange={handleChange}
                />

                {/* Upload dari device */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

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
                      if (data?.data?.url) {
                        setForm((prev: any) => ({
                          ...prev,
                          photoUrl: data.data.url,
                        }));
                      } else {
                        alert("Gagal upload foto!");
                      }
                    } catch (err) {
                      console.error("Upload gagal:", err);
                      alert("Upload error, cek console.");
                    }
                  }}
                />

                {/* 🔹 Tombol Hapus Foto */}
                {form.photoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev: any) => ({ ...prev, photoUrl: "" }))
                    }
                    className="text-sm !text-red-500 hover:!text-red-600"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>

              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                name="password"
                type="password"
                placeholder={
                  editingUser ? "Password baru (opsional)" : "Password"
                }
                value={form.password}
                onChange={handleChange}
              />
              <Select
                name="role"
                value={form.role}
                onChange={handleChange}
                options={[
                  { value: "customer", label: "Customer" },
                  { value: "admin", label: "Admin" },
                ]}
              />
              <Input
                name="fullName"
                placeholder="Nama Lengkap"
                value={form.fullName}
                onChange={handleChange}
              />
              <Input
                name="phone"
                placeholder="No. Telp"
                value={form.phone}
                onChange={handleChange}
              />
              <Input
                name="street"
                placeholder="Jalan"
                value={form.street}
                onChange={handleChange}
              />
              <Input
                name="city"
                placeholder="Kota"
                value={form.city}
                onChange={handleChange}
              />
              <Input
                name="province"
                placeholder="Provinsi"
                value={form.province}
                onChange={handleChange}
              />
              <Input
                name="postalCode"
                placeholder="Kode Pos"
                value={form.postalCode}
                onChange={handleChange}
              />
              <Input
                name="country"
                placeholder="Negara"
                value={form.country}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editingUser ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ManageUsersPage;
