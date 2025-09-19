// src/hooks/useCart.ts
import { useState, useEffect } from "react";
import type { CartItem } from "../types/product";
import { db } from "../libs/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

const CART_KEY = "user_cart";

// 🔹 helper recursive buat hapus undefined/null
const cleanDataRecursive = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => cleanDataRecursive(v)).filter((v) => v !== undefined);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, cleanDataRecursive(v)])
    );
  }
  return obj;
};

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔹 Load cart realtime dari Firestore / fallback localStorage
  useEffect(() => {
    if (user) {
      const q = collection(db, "users", user.uid, "cart");

      // ✅ realtime listener
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setCart(snap.docs.map((d) => d.data() as CartItem));
        } else {
          setCart([]);
        }
      });

      return () => unsub();
    } else {
      // 🚨 User logout → clear cart biar badge ilang
      setCart([]);
      localStorage.removeItem(CART_KEY);

      // ✅ fallback dari localStorage kalau belum login
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setCart(JSON.parse(stored));
    }
  }, [user]);

  // ✅ Add to Cart
  const addToCart = async (item: CartItem, qty: number = 1) => {
    if (user) {
      const ref = doc(db, "users", user.uid, "cart", item.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const existing = snap.data() as CartItem;
        const updated = {
          ...existing,
          cartQuantity: existing.cartQuantity + qty,
        };
        await setDoc(ref, cleanDataRecursive(updated), { merge: true });
      } else {
        await setDoc(ref, cleanDataRecursive({ ...item, cartQuantity: qty }));
      }
    } else {
      setCart((prev) => {
        let updated;
        const exist = prev.find((i) => i.id === item.id);
        if (exist) {
          updated = prev.map((i) =>
            i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + qty } : i
          );
        } else {
          updated = [...prev, { ...item, cartQuantity: qty }];
        }
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // ✅ Remove from Cart
  const removeFromCart = async (id: string, removeAll: boolean) => {
    if (user) {
      const ref = doc(db, "users", user.uid, "cart", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const existing = snap.data() as CartItem;
        if (removeAll || existing.cartQuantity <= 1) {
          await deleteDoc(ref);
        } else {
          await setDoc(
            ref,
            cleanDataRecursive({
              ...existing,
              cartQuantity: existing.cartQuantity - 1,
            }),
            { merge: true }
          );
        }
      }
    } else {
      setCart((prev) => {
        const updated = prev
          .map((i) =>
            i.id === id
              ? { ...i, cartQuantity: removeAll ? 0 : i.cartQuantity - 1 }
              : i
          )
          .filter((i) => i.cartQuantity > 0);
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // ✅ Toggle item
  const toggleItem = async (id: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
    if (user) {
      const ref = doc(db, "users", user.uid, "cart", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as CartItem;
        await setDoc(
          ref,
          cleanDataRecursive({ ...existing, selected: !existing.selected }),
          { merge: true }
        );
      }
    }
  };

  // ✅ Toggle all
  const toggleAll = async (value: boolean) => {
    setCart((prev) => prev.map((i) => ({ ...i, selected: value })));
    if (user) {
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      snap.forEach(async (d) => {
        const existing = d.data() as CartItem;
        await setDoc(
          d.ref,
          cleanDataRecursive({ ...existing, selected: value }),
          { merge: true }
        );
      });
    }
  };

  // ✅ Clear Cart
  const clearCart = async () => {
    setCart([]);
    if (user) {
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      snap.forEach(async (d) => deleteDoc(d.ref));
    }
    localStorage.removeItem(CART_KEY);
  };

  // ✅ Update qty manual
  const updateCartQuantity = async (id: string, qty: number) => {
    if (qty < 1) return;

    if (user) {
      const ref = doc(db, "users", user.uid, "cart", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existing = snap.data() as CartItem;
        await setDoc(
          ref,
          cleanDataRecursive({ ...existing, cartQuantity: qty }),
          { merge: true }
        );
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.id === id ? { ...i, cartQuantity: qty } : i
        );
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // ✅ Cart Count
  const cartCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    toggleItem,
    toggleAll,
    clearCart,
    updateCartQuantity,
    cartCount,
    setCart,
  };
};
