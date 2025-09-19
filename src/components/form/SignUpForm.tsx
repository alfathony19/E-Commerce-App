import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../libs/firebase";
import { validatePassword } from "../../utils/validatePassword";
import { LoadingContext } from "../../contexts/LoadingContext";
import { uploadToImgbb } from "../../services/uploadService";
import { createUserProfile } from "../../services/userService";
import { slugify } from "../../utils/slugify";
import Dialog from "../../components/common/Dialog";

import { FaImage, FaPlus } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";

function SignUpForm() {
  const navigate = useNavigate();
  const { withLoading } = useContext(LoadingContext)!;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  // 🔥 dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    buttonText: "OK",
    onConfirm: () => {},
  });

  // 🔥 state show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openDialog = (
    title: string,
    message: string,
    buttonText: string = "OK",
    onConfirm: () => void = () => {}
  ) => {
    setDialog({ open: true, title, message, buttonText, onConfirm });
  };

  const closeDialog = () => setDialog({ ...dialog, open: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validatePassword(form.password)) {
    openDialog(
      "Password Lemah",
      "Password minimal 8 karakter, harus ada huruf besar, huruf kecil, angka, dan simbol!"
    );
    return;
  }

  if (form.password !== form.confirmPassword) {
    openDialog("Error", "Password tidak sama!");
    return;
  }

  await withLoading(async () => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // ✅ kirim email verifikasi
      if (res.user) {
        await sendEmailVerification(res.user, {
          url: `${window.location.origin}/finish-signin`, // ⬅️ redirect setelah klik email
          handleCodeInApp: true,
        });
      }

      // ✅ upload image kalau ada file
      let photoURL = imageUrl;
      if (file) {
        photoURL = await uploadToImgbb(file);
      }

      // ✅ generate docId dari fullName
      const docId = slugify(form.fullName);

      // 🚀 Role default
      let role: "customer" | "admin" = "customer";

      // 🚨 Hardcoded proteksi: kalau email cocok → jadi admin
      if (form.email === "amarmandiri@gmail.com") {
        role = "admin";
      }

      // ✅ simpan user ke Firestore
      await createUserProfile(docId, {
        uid: res.user.uid,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        photoURL,
        role,

        profile: {
          fullName: form.fullName,
          phone: form.phone,
          address: {
            street: "",
            city: "",
            province: "",
            postalCode: "",
            country: "",
          },
          photoURL,
        },

        wishlist: [],
        cart: [],

        createdAt: new Date().toISOString(),
      });

      // ✅ feedback berhasil
      openDialog(
        "Registrasi Berhasil",
        role === "admin"
          ? "Akun ini otomatis jadi Admin 🚀"
          : "Silakan cek email Anda dan klik tautan verifikasi yang sudah kami kirim.",
        "OK",
        () => navigate(role === "admin" ? "/admin" : "/login") // ⬅️ diarahkan ke login setelah daftar
      );
    } catch (err: unknown) {
      const error = err as { code?: string; message: string };

      if (error.code === "auth/email-already-in-use") {
        openDialog(
          "Akun Sudah Ada",
          "Email ini sudah terdaftar. Silakan login.",
          "Login",
          () => navigate("/login")
        );
      } else {
        openDialog("Error", error.message);
      }
    }
  });
};

  return (
    <div className="min-h-screen flex">
      {/* Kiri */}
      <div className="hidden md:flex w-1/2 !bg-gradient-to-br from-teal-600 !to-cyan-500 items-center justify-center !text-white p-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Cetak Apapun, Dimanapun</h1>
          <p className="text-lg">
            Dari kartu nama, undangan, hingga packaging — semua bisa dicetak
            dengan kualitas terbaik di E-Shop Printing.
          </p>
        </div>
      </div>

      {/* Kanan */}
      <div className="mt-16 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-600">
            Daftar Akun Baru
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Upload Image */}
            <div className="flex flex-col items-center gap-2">
              <label className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="avatar preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="avatar preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <FaImage className="text-gray-400 text-2xl" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="hidden"
                />
              </label>
              <div className="flex items-center gap-2">
                <FaPlus className="text-teal-600" />
                <input
                  type="text"
                  placeholder="Link gambar"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="border rounded px-3 py-1 text-sm w-48"
                />
              </div>
            </div>

            <input
              type="text"
              name="fullName"
              placeholder="Nama Lengkap"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="No. Telepon"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 pr-10" // kasih padding kanan biar ikon ga nutupin text
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Ulangi Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 pr-10"
                required
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showConfirm ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full !bg-teal-600 !text-white py-2 !rounded-lg hover:!bg-teal-700 transition"
            >
              Daftar
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-teal-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* 🔥 Dialog */}
      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        buttonText={dialog.buttonText}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
}

export default SignUpForm;
