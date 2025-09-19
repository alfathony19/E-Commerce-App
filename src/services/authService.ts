import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../libs/firebase"; // bikin firebase.ts buat init firebase

import type { LoginData, RegisterData } from "../types/auth";

export const login = ({ email, password }: LoginData) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const register = ({ email, password }: RegisterData) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};
