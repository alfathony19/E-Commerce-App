import { useState } from "react";
import { sendLoginLink } from "../../services/emailAuthService";

export default function EmailLinkLoginForm() {
  const [email, setEmail] = useState("");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendLoginLink(email);
      alert("✅ Link login sudah dikirim ke email kamu!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengirim link, coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSendLink} className="space-y-4">
      <input
        type="email"
        placeholder="Masukkan email kamu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />
      <button
        type="submit"
        className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
      >
        Kirim Link Login
      </button>
    </form>
  );
}
