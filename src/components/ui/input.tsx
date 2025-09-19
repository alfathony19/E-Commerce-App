import  { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-xl border !border-gray-300 px-3 py-2 text-sm shadow-sm focus:!border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
