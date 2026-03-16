import { createContext, useContext, useMemo, useState } from "react";
import { useLogout } from "../hooks/authHook";

const STORAGE_KEY = "cc_auth_user";
const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const logoutMutation = useLogout();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading: logoutMutation.isPending,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      logout,
    }),
    [user, logoutMutation.isPending]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
