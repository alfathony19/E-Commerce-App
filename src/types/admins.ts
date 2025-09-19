import type { Timestamp } from "./common";

export type AdminRole =
  | "super_admin"
  | "order_manager"
  | "product_manager"
  | "promo_manager";
export type AdminStatus = "active" | "suspended" | "deleted";

export interface Admin extends Timestamp {
  adminId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: string[]; // granular access
  status: AdminStatus;
  lastLogin?: string;
}
