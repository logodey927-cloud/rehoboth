import { io } from "socket.io-client";
import { getServerOrigin } from "../config/env.js";

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
  socket = io(getServerOrigin(), {
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
