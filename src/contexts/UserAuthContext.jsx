/**
 * Customer authentication context.
 * Mirrors the existing TeamMemberAuthContext / AdminAuthContext patterns.
 *
 * Stored in localStorage:
 *   user_access_token   — short-lived JWT (15 min default)
 *   user_refresh_token  — long-lived rotation token (7 days)
 *   user_data           — serialised user object
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { refreshUserToken, unwrapApiData, clearUserSessionStorage } from "../api/api";

/** Returns the JWT exp timestamp in ms, or 0 if unreadable. */
function getJwtExpiry(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp * 1000;
  } catch {
    return 0;
  }
}

function isValidJwt(token) {
  return typeof token === "string" && token.split(".").length === 3 && token.length > 20;
}

function userFromJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.userId) return null;
    return { id: payload.userId, role: payload.role || "CLIENT" };
  } catch {
    return null;
  }
}

function parseStoredUser(savedData, savedToken) {
  if (savedData) {
    const parsed = JSON.parse(savedData);
    if (parsed && (parsed.id || parsed.email)) return parsed;
  }
  return userFromJwt(savedToken);
}

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const startupRefreshDone = useRef(false);

  const resetSession = useCallback(() => {
    clearUserSessionStorage();
    setUser(null);
    setAccessToken(null);
  }, []);

  // ── Restore session on mount; refresh proactively if token expires soon ────
  useEffect(() => {
    const savedToken   = localStorage.getItem("user_access_token");
    const savedRefresh = localStorage.getItem("user_refresh_token");
    const savedData    = localStorage.getItem("user_data");

    if (!savedToken || !isValidJwt(savedToken)) {
      if (savedToken || savedData || savedRefresh) resetSession();
      setLoading(false);
      return;
    }

    try {
      const restoredUser = parseStoredUser(savedData, savedToken);
      if (!restoredUser) {
        resetSession();
        setLoading(false);
        return;
      }

      setAccessToken(savedToken);
      setUser(restoredUser);

      const expiresAt = getJwtExpiry(savedToken);
      const soonMs    = Date.now() + 5 * 60 * 1000;
      if (savedRefresh && isValidJwt(savedRefresh) && expiresAt < soonMs && !startupRefreshDone.current) {
        startupRefreshDone.current = true;
        refreshUserToken(savedRefresh)
          .then((res) => {
            if (res.data?.success) {
              const { accessToken: newAccess, refreshToken: newRefresh } = unwrapApiData(res);
              if (!isValidJwt(newAccess)) throw new Error("invalid access token");
              localStorage.setItem("user_access_token", newAccess);
              if (newRefresh && isValidJwt(newRefresh)) {
                localStorage.setItem("user_refresh_token", newRefresh);
              }
              setAccessToken(newAccess);
            } else {
              resetSession();
            }
          })
          .catch(() => {
            // Only clear if the access token is actually expired
            if (getJwtExpiry(savedToken) < Date.now()) {
              resetSession();
            }
          })
          .finally(() => setLoading(false));
        return;
      }
    } catch {
      resetSession();
    }
    setLoading(false);
  }, [resetSession]);

  // ── Sync with axios interceptor token refresh / session expiry ─────────────
  useEffect(() => {
    const onTokenRefreshed = (e) => {
      const newAccess = e.detail?.accessToken;
      if (newAccess && isValidJwt(newAccess)) setAccessToken(newAccess);
    };
    const onSessionExpired = () => resetSession();

    window.addEventListener("user:token-refreshed", onTokenRefreshed);
    window.addEventListener("user:session-expired", onSessionExpired);
    return () => {
      window.removeEventListener("user:token-refreshed", onTokenRefreshed);
      window.removeEventListener("user:session-expired", onSessionExpired);
    };
  }, [resetSession]);

  const persist = useCallback((newAccessToken, newRefreshToken, userData) => {
    if (!isValidJwt(newAccessToken) || !userData) return false;
    localStorage.setItem("user_access_token", newAccessToken);
    if (newRefreshToken && isValidJwt(newRefreshToken)) {
      localStorage.setItem("user_refresh_token", newRefreshToken);
    }
    localStorage.setItem("user_data", JSON.stringify(userData));
    setAccessToken(newAccessToken);
    setUser(userData);
    return true;
  }, []);

  const login = useCallback((newAccessToken, newRefreshToken, userData) => {
    persist(newAccessToken, newRefreshToken, userData);
  }, [persist]);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("user_refresh_token");
    if (refreshToken) {
      import("../api/api").then(({ logoutUser }) => logoutUser(refreshToken).catch(() => {}));
    }
    import("../utils/chatSocket").then(({ disconnectChatSocket }) => disconnectChatSocket());
    resetSession();
  }, [resetSession]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("user_refresh_token");
      if (!refreshToken || !isValidJwt(refreshToken)) return null;

      const res = await refreshUserToken(refreshToken);
      if (res.data?.success) {
        const { accessToken: newAccess, refreshToken: newRefresh } = unwrapApiData(res);
        if (!isValidJwt(newAccess)) throw new Error("invalid access token");
        localStorage.setItem("user_access_token", newAccess);
        if (newRefresh && isValidJwt(newRefresh)) {
          localStorage.setItem("user_refresh_token", newRefresh);
        }
        setAccessToken(newAccess);
        return newAccess;
      }
    } catch {
      logout();
    }
    return null;
  }, [logout]);

  const isAuthenticated = !!user && !!accessToken && isValidJwt(accessToken);

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
