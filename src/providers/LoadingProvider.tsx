// src/providers/LoadingProvider.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { LoadingContext } from "../contexts/LoadingContext";
import type { LoadingContextType } from "../contexts/LoadingContext";

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const withLoading: LoadingContextType["withLoading"] = async (fn) => {
    showLoading();
    try {
      return await fn();
    } finally {
      hideLoading();
    }
  };

  return (
    <LoadingContext.Provider
      value={{ isLoading, showLoading, hideLoading, withLoading }}
    >
      {children}
      {/* ❌ Spinner bawaan dihapus, cukup pakai LoadingOverlay di App.tsx */}
    </LoadingContext.Provider>
  );
};
