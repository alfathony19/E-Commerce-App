import { createRequire } from "module";
import admin from "firebase-admin";

const require = createRequire(import.meta.url);
const serviceAccount = require("../../order-cleaner/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const email = "amarmandiriprinting@gmail.com"; // ganti dengan email user

async function setAdminByEmail() {
  try {
    // ✅ cari user berdasarkan email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log("📌 UID user:", userRecord.uid);

    // ✅ set claim admin
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    // ✅ cek hasil claim
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log("✅ Claims sekarang:", updatedUser.customClaims);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

setAdminByEmail();
