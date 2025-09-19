import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) => {
  const base =
    "rounded-xl font-medium focus:outline-none focus:ring transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "!bg-blue-600 !text-white hover:!bg-blue-700 focus:!ring-blue-300",
    secondary:
      "!bg-gray-200 !text-gray-800 hover:!bg-gray-300 focus:!ring-gray-400",
    destructive: "!bg-red-600 !text-white hover:!bg-red-700 focus:!ring-red-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
