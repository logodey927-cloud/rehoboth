import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

let socket = null;

export function getChatSocket(token) {
  if (socket) {
    if (token && socket.auth?.token !== token) {
      socket.auth = { token };
      if (socket.connected) socket.disconnect();
      socket.connect();
    }
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: { token: token || "" },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
