import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

let socket = null;

export function getAdminSocket() {
  const token = localStorage.getItem("admin_token") || "";
  if (socket) {
    if (token && socket.auth?.token !== token) {
      socket.auth = { token };
      if (socket.connected) socket.disconnect();
      socket.connect();
    }
    return socket;
  }
  socket = io(SERVER_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
