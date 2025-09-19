import { auth } from "../libs/firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

const actionCodeSettings = {
  url: "http://localhost:5173/finishSignIn", // ganti sesuai domain production nanti
  handleCodeInApp: true,
};

// Kirim link login ke email
export const sendLoginLink = async (email: string) => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
};

// Selesai login ketika user klik link dari email
export const completeSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      email = window.prompt("Masukin email kamu lagi:");
    }
    const result = await signInWithEmailLink(
      auth,
      email!,
      window.location.href
    );
    window.localStorage.removeItem("emailForSignIn");
    return result.user;
  }
};
