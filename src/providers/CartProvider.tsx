import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { CartContext } from "../contexts/CartContext";
import type { Product, CartItem } from "../types/product";
import { mapProductToCartItem } from "../utils/cartMapper";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

const addToCart = (product: Product | CartItem) => {
  setCart((prev) => {
    const exist = prev.find((item) => item.id === product.id);
    if (exist) {
      return prev.map((item) =>
        item.id === product.id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      );
    }

    // 🔥 kalau udah CartItem langsung push
    // kalau masih Product → convert dulu ke CartItem
    const newItem: CartItem =
      "cartQuantity" in product ? product : mapProductToCartItem(product);

    return [...prev, newItem];
  });
};

  const removeFromCart = (productId: string, removeAll = false) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                cartQuantity: removeAll ? 0 : item.cartQuantity - 1,
              }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // ✅ toggle 1 item
  const toggleItem = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✅ toggle semua item
  const toggleAll = (selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.cartQuantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        toggleItem,
        toggleAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
