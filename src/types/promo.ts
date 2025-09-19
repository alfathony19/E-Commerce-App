import type { Timestamp } from "./common";

export type PromoType = "percentage" | "fixed";

export interface Promo extends Timestamp {
  promoId: string;
  title: string;
  description: string;
  type: PromoType;
  value: number; // ex: 20% atau Rp50000
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
