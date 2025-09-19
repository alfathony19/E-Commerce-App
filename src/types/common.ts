export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Timestamp {
  createdAt: string; // ISO date string
  updatedAt?: string;
}
