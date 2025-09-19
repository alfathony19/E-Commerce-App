import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ResetSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🚀 cek role dari custom claims atau Firestore
        user.getIdTokenResult().then((token) => {
          const role = token.claims.role || "customer"; // default kalau tidak ada claim
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        });
      } else {
        // kalau belum login, arahkan ke halaman login
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Password Berhasil Direset 🎉
        </h1>
        <p className="text-gray-600">
          Tunggu sebentar, Anda akan diarahkan ke dashboard...
        </p>
      </div>
    </div>
  );
}
