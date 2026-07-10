import { createContext, useContext } from "react";

// Kept in its own file (no component export) so React Fast Refresh stays happy.
export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
};
