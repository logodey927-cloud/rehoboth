import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAdmin, clearAdminSessionStorage, resetAdminSessionRedirectGuard, unwrapApiData, getApiErrorMessage } from "../../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    clearAdminSessionStorage();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        localStorage.setItem("admin_authenticated", "true");
      } catch {
        clearAdminSessionStorage();
      }
    } else if (
      localStorage.getItem("admin_authenticated") === "true" ||
      savedUser
    ) {
      // Stale session (flag/user without JWT) — caused login ↔ dashboard loops
      clearAdminSessionStorage();
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => logout();
    window.addEventListener("admin:session-expired", onSessionExpired);
    return () => window.removeEventListener("admin:session-expired", onSessionExpired);
  }, [logout]);

  const login = async (username, password) => {
    try {
      const response = await loginAdmin(username, password);
      if (response.data.success) {
        const payload = unwrapApiData(response);
        if (payload?.requires2FA) {
          return { success: false, error: payload.message || "Two-factor authentication is required." };
        }
        const accessToken = payload?.accessToken;
        if (!accessToken) {
          return { success: false, error: "Login failed: no session token received." };
        }
        setIsAuthenticated(true);
        setUser(payload.user);
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_user", JSON.stringify(payload.user));
        localStorage.setItem("admin_token", accessToken);
        resetAdminSessionRedirectGuard();
        return { success: true };
      }
      return { success: false, error: response.data.message || "Login failed" };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Network error. Please try again.");
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem("admin_user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

