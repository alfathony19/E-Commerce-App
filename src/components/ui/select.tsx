import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const Select = ({ options, className, ...props }: SelectProps) => {
  return (
    <select
      className={clsx(
        "w-full rounded-xl border !border-gray-300 px-3 py-2 text-sm shadow-sm focus:!border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
