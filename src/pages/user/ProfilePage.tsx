import { useEffect, useState } from "react";
import { auth, db } from "../../libs/firebase";
import { updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadToImgBB } from "../../libs/imgbb";
import Dialog from "../../components/common/Dialog";
import { ImagePlus } from "lucide-react";

// ---------- Types ----------
interface FormState {
  fullName: string;
  email: string;
  phone: string;
  photoURL: string;
  password: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  action?: () => void;
}

const ProfilePage = () => {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    photoURL: "",
    password: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: "",
    message: "",
  });

  // ---------- Load Firestore profile ----------
useEffect(() => {
  if (!user) return;
  const loadProfile = async () => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      // ✅ kalau belum ada createdAt di Firestore, fallback dari metadata Auth
      if (!data.createdAt && user.metadata?.creationTime) {
        const createdAtDate = new Date(user.metadata.creationTime);

        // 🚀 simpan ke Firestore biar permanen
        await updateDoc(ref, { createdAt: createdAtDate });

        data.createdAt = createdAtDate;
      }

      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        photoURL: data.photoURL || "",
        password: "",
        street: data.profile?.address?.street || "",
        city: data.profile?.address?.city || "",
        province: data.profile?.address?.province || "",
        postalCode: data.profile?.address?.postalCode || "",
        country: data.profile?.address?.country || "",
      });
    }
  };
  loadProfile();
}, [user]);


  // ---------- Handlers ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);

    await updateDoc(ref, {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      photoURL: form.photoURL,
      profile: {
        fullName: form.fullName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          country: form.country,
        },
        photoURL: form.photoURL,
        updatedAt: serverTimestamp(),
      },
    });

    if (form.email && form.email !== user.email) {
      await updateEmail(user, form.email);
    }

    if (form.password) {
      await updatePassword(user, form.password);
    }

    // reload profile biar langsung keliatan update
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProfile(snap.data());
    }

    setDialog({
      open: true,
      title: "Sukses",
      message: "Profil berhasil diperbarui!",
    });
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteUser(user);
    setDialog({
      open: true,
      title: "Akun Terhapus",
      message: "Akun kamu berhasil dihapus.",
    });
  };

  const handleUpload = async (file: File) => {
    const url = await uploadToImgBB(file);
    if (url) {
      setForm((prev) => ({ ...prev, photoURL: url }));
    }
  };

  // ---------- JSX ----------
  return (
    <>
      <div className="mt-16 bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kiri: Avatar + Informasi */}
        <div className="md:col-span-1 flex flex-col items-center">
          {/* Foto Profil / Avatar */}
          <div className="relative w-32 h-32 mb-10">
            {form.photoURL ? (
              <img
                src={form.photoURL}
                alt="Foto Profil"
                className="w-32 h-32 rounded-full object-cover border shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center text-2xl font-bold text-white">
                {form.fullName
                  ? form.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "AG"}
              </div>
            )}
          </div>

          {/* Informasi dari Firestore */}
          {profile && (
            <div className="w-full mt-2 text-sm space-y-4">
              {/* Informasi Profil */}
              <div>
                <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">
                  Informasi Profil
                </h3>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {profile.email || "-"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {profile.phone || "-"}
                </p>
                <div>
                  <span className="font-medium">Alamat:</span>
                  <ul className="ml-4 list-disc">
                    <li>Jalan: {profile.profile?.address?.street || "-"}</li>
                    <li>Kota: {profile.profile?.address?.city || "-"}</li>
                    <li>
                      Provinsi: {profile.profile?.address?.province || "-"}
                    </li>
                    <li>
                      Kode Pos: {profile.profile?.address?.postalCode || "-"}
                    </li>
                    <li>Negara: {profile.profile?.address?.country || "-"}</li>
                  </ul>
                </div>
              </div>

              {/* Informasi Akun */}
              <div>
                <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">
                  Informasi Akun
                </h3>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {profile.role || "customer"}
                </p>
                <p>
                  <span className="font-medium">Dibuat pada:</span>{" "}
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Kanan: Form Input */}
        <div className="md:col-span-2 flex flex-col items-center">
          {/* Avatar di atas form (center) */}
          <div className="relative w-32 h-32 mb-1">
            <img
              src={form.photoURL}
              alt=""
              className="w-32 h-32 rounded-full object-cover border shadow-md"
            />

            {/* Overlay Upload */}
            <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/40 hover:bg-black/60 transition">
              <ImagePlus size={38} className="text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Input manual link */}
          <div className="px-4 py-4">
            <input
              type="text"
              placeholder="Atau masukkan URL foto (misal profil FB)"
              value={form.photoURL}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, photoURL: e.target.value }))
              }
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>

          {/* Form Input */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              className="border p-2 w-full rounded"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 w-full rounded"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password baru"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nomor Telepon"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Alamat Jalan"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Kota"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="province"
              value={form.province}
              onChange={handleChange}
              placeholder="Provinsi"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              placeholder="Kode Pos"
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Negara"
              className="border p-2 w-full rounded"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 w-full mt-6">
            <button
              onClick={handleSave}
              className="flex-1 !bg-cyan-600 !text-white hover:!bg-cyan-700 px-4 py-2 rounded"
            >
              Simpan
            </button>
            <button
              onClick={() =>
                setDialog({
                  open: true,
                  title: "Hapus Akun",
                  message: "Apakah kamu yakin ingin menghapus akun ini?",
                  action: handleDelete,
                })
              }
              className="flex-1 !bg-red-600 !text-white hover:!bg-red-700 px-4 py-2 rounded"
            >
              Hapus Akun
            </button>
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi */}
      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ ...dialog, open: false })}
        onConfirm={dialog.action}
      />
    </>
  );
};

export default ProfilePage;
