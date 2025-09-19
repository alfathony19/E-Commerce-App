// libs/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQoYQYa7wo7Jp1R3_ha69_ojKItb5e9t4",
  authDomain: "amar-mandiri-digital-printing.firebaseapp.com",
  projectId: "amar-mandiri-digital-printing",
  storageBucket: "amar-mandiri-digital-printing.firebasestorage.app",
  messagingSenderId: "550679200450",
  appId: "1:550679200450:web:bf291b8a192278986f715b",
  measurementId: "G-STHTQP2WDB"
};

const app = initializeApp(firebaseConfig);

// ✅ Auth dengan Local Persistence (session nyimpen di localStorage)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

// ✅ Firestore
export const db = getFirestore(app);
