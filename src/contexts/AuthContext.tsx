import { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  updateProfile as fbUpdateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AuthContextType, AppUser } from "../types/auth";
import { auth, db } from "../libs/firebase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load user dari Firebase Auth & Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Ambil custom claims
          const tokenResult = await firebaseUser.getIdTokenResult(true); // force refresh token
          console.log("🔥 Token claims:", tokenResult.claims); // debug, lihat apakah admin: true
          setIsAdmin(!!tokenResult.claims.admin);


          // Ambil data profil dari Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as AppUser;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: data.name || "",
              avatar: data.avatar || "",
              birthPlace: data.birthPlace,
              birthDate: data.birthDate,
              gender: data.gender,
              hobby: data.hobby,
              address: data.address,
              phone: data.phone,
            });
          } else {
            // Jika user baru, buat doc default
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "Anonymous",
            };
            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  }, []);

  // Update profil user
  const updateProfile = useCallback(
    async (data: Partial<AppUser>) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, data, { merge: true });

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...data } : prev));

      // Optional: update Firebase Auth displayName / photoURL
      if (data.name || data.avatar) {
        await fbUpdateProfile(auth.currentUser!, {
          displayName: data.name ?? undefined,
          photoURL: data.avatar ?? undefined,
        });
      }
    },
    [user]
  );

  // Ganti password
  const changePassword = useCallback(async (newPassword: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
