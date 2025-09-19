import type { ReactNode } from "react";
import { AuthProvider as ContextProvider } from "../contexts/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <ContextProvider>{children}</ContextProvider>;
};
