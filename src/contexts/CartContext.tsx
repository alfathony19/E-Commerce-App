import { createContext } from "react";
import type { Product, CartItem } from "../types/product";

export type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product | CartItem) => void;
  removeFromCart: (id: string, removeAll?: boolean) => void;
  clearCart: () => void;
  cartCount: number;
  toggleItem: (id: string) => void;
  toggleAll: (selected: boolean) => void;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
