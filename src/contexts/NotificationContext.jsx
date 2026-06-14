import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useUserAuth } from "./UserAuthContext";
import {
  getMyNotifications as apiGetMyNotifications,
  markMyNotificationRead as apiMarkRead,
  markAllMyNotificationsRead as apiMarkAllRead,
  deleteMyNotification as apiDeleteOne,
  deleteMyNotificationsBulk as apiDeleteBulk,
} from "../api/api";
import { getChatSocket } from "../utils/chatSocket";

const POLL_INTERVAL = 30_000; // 30 seconds

const NotificationContext = createContext(null);

function normaliseNotification(n) {
  return {
    id: n.id,
    type: n.type || "reminder",
    eventKey: n.event_key || n.type || "reminder",
    title: n.title || "",
    message: n.body || n.title || "",
    body: n.body || "",
    linkPath: n.link_path || null,
    timeLabel: n.created_at
      ? new Date(n.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "",
    createdAt: n.created_at,
    unread: !n.is_read,
    meta: n.meta || {},
  };
}

export function NotificationProvider({ children }) {
  const { accessToken, isAuthenticated } = useUserAuth();
  const [notifications, setNotifications] = useState([]);
  const [fetched, setFetched] = useState(false);
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  const fetchNotifications = useCallback((token) => {
    const t = token ?? tokenRef.current;
    if (!t) return;
    apiGetMyNotifications(t)
      .then((res) => {
        if (res.data?.success) {
          setNotifications((res.data.notifications || []).map(normaliseNotification));
        }
      })
      .catch(() => {})
      .finally(() => setFetched(true));
  }, []);

  // Initial fetch when access token becomes available
  useEffect(() => {
    if (!accessToken) {
      setNotifications([]);
      setFetched(false);
      return;
    }
    fetchNotifications(accessToken);
  }, [accessToken, fetchNotifications]);

  // Polling — refreshes the bell every 30 s while the user is logged in
  useEffect(() => {
    if (!accessToken) return;
    const id = setInterval(() => fetchNotifications(accessToken), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [accessToken, fetchNotifications]);

  // Socket-driven refresh — re-fetch when admin sends a chat message (chat.admin_replied
  // creates an in-app notification that the poll would catch, but socket makes it instant)
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    const socket = getChatSocket(accessToken);
    const handleMsg = (msg) => {
      // A non-user message may have created an in-app notification — refresh immediately
      if (msg.senderType !== "user" && msg.sender_type !== "user") {
        fetchNotifications(accessToken);
      }
    };
    socket.on("chat:message", handleMsg);
    return () => socket.off("chat:message", handleMsg);
  }, [isAuthenticated, accessToken, fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = useCallback(
    (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      if (accessToken) apiMarkRead(accessToken, id).catch(() => {});
    },
    [accessToken]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (accessToken) apiMarkAllRead(accessToken).catch(() => {});
  }, [accessToken]);

  const deleteNotification = useCallback(
    (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (accessToken) apiDeleteOne(accessToken, id).catch(() => {});
    },
    [accessToken]
  );

  const deleteNotifications = useCallback(
    (ids) => {
      const idSet = new Set(ids);
      setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)));
      if (accessToken && ids.length > 0) apiDeleteBulk(accessToken, ids).catch(() => {});
    },
    [accessToken]
  );

  const refresh = useCallback(() => fetchNotifications(), [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications, setNotifications,
        unreadCount,
        markAsRead, markAllRead,
        deleteNotification, deleteNotifications,
        fetched, refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
