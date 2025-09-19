// src/components/ui/alert.tsx
import type { ReactNode } from "react";
import { cn } from "../../libs/utils"; // kalo ada helper cn, buat gabungin className

interface AlertProps {
  children: ReactNode;
  className?: string;
  variant?: "info" | "success" | "warning" | "error";
}

export function Alert({ children, className, variant = "info" }: AlertProps) {
  const baseStyle =
    "w-full rounded-lg p-4 text-sm font-medium flex items-start gap-2";

  const variants: Record<typeof variant, string> = {
    info: "!bg-blue-100 !text-blue-800",
    success: "!bg-green-100 !text-green-800",
    warning: "!bg-yellow-100 !text-yellow-800",
    error: "!bg-red-100 !text-red-800",
  };

  return (
    <div className={cn(baseStyle, variants[variant], className)}>
      {children}
    </div>
  );
}
