// src/utils/cartMapper.ts
import type { Product, CartItem } from "../types/product";

export const mapProductToCartItem = (product: Product, qty = 1): CartItem => ({
  ...product,
  cartQuantity: qty,
  selected: true,
});
