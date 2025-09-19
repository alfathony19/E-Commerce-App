// src/types/user.ts
import type { Address, Timestamp } from "./common";

export type UserStatus = "active" | "banned" | "deleted";

export interface User extends Timestamp {
  uid: string;
  email: string | null;
  fullName: string;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string;
  phoneNumber?: string;
  address?: Address[];
  status: UserStatus;
  lastLogin?: string;
}
