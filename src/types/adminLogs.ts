// types/adminLogs.ts

export type LogAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PROMO_APPLIED"
  | "STATUS_CHANGED";

export type LogTarget =
  | "USER"
  | "ORDER"
  | "PRODUCT"
  | "PROMO"
  | "REVIEW"
  | "ADMIN";

export interface AdminLog {
  logId: string; // unique id log
  adminId: string; // siapa yang melakukan
  action: LogAction; // aksi apa yg dilakukan
  target: LogTarget; // entitas yg kena aksi
  targetId?: string; // ID entitas yg dimaksud (misalnya userId, orderId)
  description: string; // penjelasan singkat
  createdAt: string; // ISO timestamp
}
