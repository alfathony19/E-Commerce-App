import { createContext } from "react";

export type LoadingContextType = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);
