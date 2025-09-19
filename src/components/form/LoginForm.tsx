import { useState, useContext } from "react";
import { LoadingContext } from "../../contexts/LoadingContext";
import { FaUserCircle } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../libs/firebase"; 
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../libs/firebase";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";
import Dialog from "../../components/common/Dialog";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { withLoading } = useContext(LoadingContext)!;
  const navigate = useNavigate();

  // ✅ dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    buttonText: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const openDialog = (
    title: string,
    message: string,
    buttonText = "OK",
    onConfirm?: () => void
  ) => {
    setDialog({
      open: true,
      title,
      message,
      buttonText,
      onConfirm,
    });
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  await withLoading(async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (!res.user.emailVerified) {
        await sendEmailVerification(res.user);
        openDialog(
          "Email Belum Diverifikasi",
          "Kami sudah mengirim link verifikasi ke email Anda. Silakan cek inbox atau folder spam.",
          "OK"
        );
        return;
      }

      // ✅ Cek role admin dari Firestore, bukan dari custom claims
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      let isAdmin = false;
      if (userDoc.exists()) {
        const data = userDoc.data();
        isAdmin = data.role === "admin" || data.admin === true;
      }

      openDialog("Login Berhasil", "Selamat datang kembali!", "Tutup");

      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin/dashboard-admin"); // kalau admin → dashboard admin
        } else {
          navigate("/user/dashboard"); // kalau user biasa → dashboard user
        }
      }, 1200);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/wrong-password":
            openDialog(
              "Password Salah",
              "Apakah Anda ingin reset password?",
              "Reset",
              () => navigate("/forgot-password")
            );
            break;
          case "auth/user-not-found":
            openDialog(
              "Akun Tidak Ditemukan",
              "Silakan daftar terlebih dahulu.",
              "Daftar",
              () => navigate("/signup")
            );
            break;
          case "auth/invalid-email":
            openDialog(
              "Email Tidak Valid",
              "Silakan periksa kembali format email Anda."
            );
            break;
          default:
            openDialog("Gagal Login", "Terjadi kesalahan. Coba lagi nanti.");
        }
      } else {
        console.error(error);
        openDialog("Error", "Terjadi kesalahan pada sistem!");
      }
    }
  });
};

  return (
    <div className="min-h-screen flex">
      {/* Kolom Kiri */}
      <div className="hidden md:flex w-1/2 bg-teal-600 text-white flex-col justify-center p-16">
        <h1 className="text-4xl font-bold mb-6">
          Selamat Datang di Percetakan Kami!
        </h1>
        <p className="text-lg mb-4">
          Cetak brosur, kartu nama, flyer, banner, dan packaging dengan kualitas
          terbaik.
        </p>
        <p className="text-lg">
          Cepat, aman, dan harga bersaing. Temukan kemudahan dalam setiap
          cetakan.
        </p>
      </div>

      {/* Kolom Kanan */}
      <div className="flex flex-1 justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <FaUserCircle className="text-6xl text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {/* Password + Eye */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full !bg-teal-600 !text-white py-2 !rounded-lg hover:!bg-teal-700 transition"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm text-teal-600">
            <a href="/forgot-password" className="hover:underline">
              Lupa kata sandi?
            </a>
            <a href="/signup" className="hover:underline">
              Tidak memiliki akun? Daftar
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Dialog */}
      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        buttonText={dialog.buttonText}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
};

export default LoginPage;
