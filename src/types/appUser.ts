import type { User } from "./user";

export interface AppUser
  extends Omit<User, "displayName" | "fullName" | "photoURL"> {
  displayName?: string;
  fullName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  permissions?: string[];
}
