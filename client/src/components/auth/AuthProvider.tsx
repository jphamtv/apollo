import React from "react";
import { AuthContext, useAuthProvider } from "../../hooks/useAuth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}