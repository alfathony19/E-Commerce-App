import { useState, useContext } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../libs/firebase";
import { LoadingContext } from "../../contexts/LoadingContext";
import Dialog from "../../components/common/Dialog";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { withLoading } = useContext(LoadingContext)!;

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

  // 🚀 Kirim link reset password
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await withLoading(async () => {
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/reset-success`, // redirect balik ke app
        });

        openDialog(
          "Tautan Dikirim",
          "Kami sudah mengirim tautan reset password ke email Anda. Silakan cek inbox atau folder spam.",
          "OK"
        );
      } catch (err: any) {
        openDialog("Error", err.message);
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Kolom Kiri */}
      <div className="hidden md:flex w-1/2 bg-teal-600 text-white flex-col justify-center p-16">
        <h1 className="text-4xl font-bold mb-6">Reset Password</h1>
        <p className="text-lg mb-4">
          Masukkan email Anda, kami akan mengirimkan tautan untuk reset
          password.
        </p>
      </div>

      {/* Kolom Kanan */}
      <div className="flex flex-1 justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Lupa Password</h2>

          <form onSubmit={handleSendLink} className="space-y-4">
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="w-full !bg-teal-600 !text-white py-2 !rounded-lg hover:!bg-teal-700 transition"
            >
              Kirim Link Reset
            </button>
          </form>
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

export default ForgotPasswordPage;
