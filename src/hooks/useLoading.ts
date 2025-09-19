// src/hooks/useLoading.ts
import { useContext } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
};
