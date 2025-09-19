export function generateOrderId(): string {
  const prefix = "ORD";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // 20250822
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5F3A9C
  return `${prefix}-${datePart}-${randomPart}`;
}
