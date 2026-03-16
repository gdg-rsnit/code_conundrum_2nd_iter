import { createContext, useContext, useMemo, useState } from "react";
import { useLogout } from "../hooks/authHook";

const STORAGE_KEY = "cc_auth_user";
const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const data = JSON.parse(raw);
    
    // Handle old format (direct user object) for backward compatibility
    if (!data.expiresAt) {
      // Old format detected, clear it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Check if session has expired
    if (Date.now() >= data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return data.user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const logoutMutation = useLogout();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout API error:', error);
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
