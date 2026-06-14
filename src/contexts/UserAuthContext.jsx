/**
 * Customer authentication context.
 * Mirrors the existing TeamMemberAuthContext / AdminAuthContext patterns.
 *
 * Stored in localStorage:
 *   user_access_token   — short-lived JWT (1 h)
 *   user_refresh_token  — long-lived rotation token (30 days)
 *   user_data           — serialised user object
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { refreshUserToken } from "../api/api";

/** Returns the JWT exp timestamp in ms, or 0 if unreadable. */
function getJwtExpiry(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000;
  } catch {
    return 0;
  }
}

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const startupRefreshDone = useRef(false);

  // ── Restore session on mount; refresh proactively if token expires soon ────
  useEffect(() => {
    const savedToken   = localStorage.getItem("user_access_token");
    const savedRefresh = localStorage.getItem("user_refresh_token");
    const savedData    = localStorage.getItem("user_data");

    if (savedToken && savedData) {
      try {
        setAccessToken(savedToken);
        setUser(JSON.parse(savedData));

        // If the access token expires within 5 minutes (or is already expired),
        // refresh now so the first API calls don't hit a 401.
        const expiresAt = getJwtExpiry(savedToken);
        const soonMs    = Date.now() + 5 * 60 * 1000;
        if (savedRefresh && expiresAt < soonMs && !startupRefreshDone.current) {
          startupRefreshDone.current = true;
          refreshUserToken(savedRefresh)
            .then((res) => {
              if (res.data?.success) {
                const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
                localStorage.setItem("user_access_token", newAccess);
                if (newRefresh) localStorage.setItem("user_refresh_token", newRefresh);
                setAccessToken(newAccess);
              } else {
                // Refresh rejected — clear stale session
                localStorage.removeItem("user_access_token");
                localStorage.removeItem("user_refresh_token");
                localStorage.removeItem("user_data");
                setUser(null);
                setAccessToken(null);
              }
            })
            .catch(() => {
              localStorage.removeItem("user_access_token");
              localStorage.removeItem("user_refresh_token");
              localStorage.removeItem("user_data");
              setUser(null);
              setAccessToken(null);
            })
            .finally(() => setLoading(false));
          return; // setLoading(false) is called inside finally above
        }
      } catch {
        localStorage.removeItem("user_access_token");
        localStorage.removeItem("user_refresh_token");
        localStorage.removeItem("user_data");
      }
    }
    setLoading(false);
  }, []);

  // ── Keep context token in sync when the 401 interceptor silently refreshes ─
  useEffect(() => {
    const handler = (e) => {
      const newAccess = e.detail?.accessToken;
      if (newAccess) setAccessToken(newAccess);
    };
    window.addEventListener("user:token-refreshed", handler);
    return () => window.removeEventListener("user:token-refreshed", handler);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearStorage = () => {
    localStorage.removeItem("user_access_token");
    localStorage.removeItem("user_refresh_token");
    localStorage.removeItem("user_data");
  };

  const persist = (newAccessToken, newRefreshToken, userData) => {
    localStorage.setItem("user_access_token", newAccessToken);
    if (newRefreshToken) localStorage.setItem("user_refresh_token", newRefreshToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setAccessToken(newAccessToken);
    setUser(userData);
  };

  // ── Login (called after successful /api/auth/user/login) ───────────────────
  const login = useCallback((newAccessToken, newRefreshToken, userData) => {
    persist(newAccessToken, newRefreshToken, userData);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("user_refresh_token");
    // Fire-and-forget revocation (don't await — user should not be blocked)
    if (refreshToken) {
      import("../api/api").then(({ logoutUser }) => logoutUser(refreshToken).catch(() => {}));
    }
    import("../utils/chatSocket").then(({ disconnectChatSocket }) => disconnectChatSocket());
    clearStorage();
    setUser(null);
    setAccessToken(null);
  }, []);

  // ── Update local user data (after profile edit) ─────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
  }, []);

  // ── Silent token refresh ─────────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("user_refresh_token");
      if (!refreshToken) return null;

      const res = await refreshUserToken(refreshToken);
      if (res.data?.success) {
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
        localStorage.setItem("user_access_token", newAccess);
        if (newRefresh) localStorage.setItem("user_refresh_token", newRefresh);
        setAccessToken(newAccess);
        return newAccess;
      }
    } catch {
      logout();
    }
    return null;
  }, [logout]);

  const isAuthenticated = !!user && !!accessToken;

  return (
    <UserAuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshAccessToken,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
