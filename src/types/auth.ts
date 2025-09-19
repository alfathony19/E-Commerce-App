// types/auth.ts

// Extended user profile
export type AppUser = {
  uid: string; // UID Firebase
  name: string;
  avatar?: string;
  displayName?: string;
  fullName?: string;
  photoURL?: string;
  birthPlace?: string; // Tempat lahir
  birthDate?: string; // Tanggal lahir (ISO string)
  gender?: "Male" | "Female" | "Other";
  hobby?: string;
  address?: string;
  phone?: string;
  email: string;
};

// Context untuk Auth
export type AuthContextType = {
  user: AppUser | null; // User yang sedang login
  loading: boolean; // Loading state
  isAdmin: boolean; // Flag admin
  updateProfile?: (data: Partial<AppUser>) => Promise<void>; // Update profil
  changePassword?: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Data untuk login
export type LoginData = {
  email: string;
  password: string;
};

// Data untuk registrasi
export type RegisterData = {
  email: string;
  password: string;
  name: string;
};
