import admin from "firebase-admin";
import path from "path";

// Tentukan path absolut ke service account lo
const serviceAccountPath = path.join(
  process.cwd(),
  "order-cleaner/serviceAccountKey.json"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
