import { useContext } from "react";
import AuthContext from "./auth-context";
import { AuthContextType } from "./types";
import { notifyError } from "@/services/sentry";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    notifyError("useAuth must be used within AuthProvider");
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
