const admin = require("firebase-admin");
const fs = require("fs");

// load key
const serviceAccount = require("./serviceAccountKey.json");

// init firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanExpiredOrders() {
  const now = Date.now();
  const snapshot = await db.collection("orders").get();

  let deleted = 0;
  snapshot.forEach(async (doc) => {
    const data = doc.data();
    // pastikan order punya timestamp
    if (data.createdAt && data.status === "pending") {
      const created = data.createdAt.toMillis(); // kalau pakai Firestore Timestamp
      const expired = created + 24 * 60 * 60 * 1000; // +24 jam
      if (now > expired) {
        await db.collection("orders").doc(doc.id).delete(); // bisa juga update status jadi "expired"
        deleted++;
        console.log(`Order ${doc.id} expired & deleted`);
      }
    }
  });

  console.log(`Done. Deleted: ${deleted} expired orders`);
}

cleanExpiredOrders().then(() => process.exit());
