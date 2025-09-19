import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeSignIn } from "../../services/emailAuthService";

export default function FinishSignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const doSignIn = async () => {
      try {
        const user = await completeSignIn();
        if (user) {
          alert("✅ Login berhasil!");
          navigate("/user/dashboard");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Link login tidak valid atau sudah kadaluarsa.");
        navigate("/login");
      }
    };
    doSignIn();
  }, [navigate]);

  return <p className="text-center mt-20">Sedang memproses login...</p>;
}
