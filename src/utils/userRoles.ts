import { auth } from "../libs/firebaseAdmin";

// 🚀 Set custom claim role untuk user tertentu
export async function setUserRole(uid: string, role: "admin" | "user") {
  await auth.setCustomUserClaims(uid, { role });
  return `User ${uid} sekarang jadi ${role}`;
}

// 🔐 Verifikasi token & role
export async function verifyUserToken(token: string) {
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded; // berisi uid, email, role, dll
  } catch (err) {
    return null;
  }
}
