import { io } from "socket.io-client";
import { getServerOrigin } from "../config/env.js";

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

  socket = io(getServerOrigin(), {
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
