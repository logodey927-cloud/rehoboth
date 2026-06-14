/**
 * Keeps a Socket.IO connection open while the customer is logged in
 * so admins see them under "Online Users" on Live Chat.
 */
import { useEffect } from "react";
import { useUserAuth } from "../../contexts/UserAuthContext";
import { getChatSocket, disconnectChatSocket } from "../../utils/chatSocket";

export default function UserChatPresence() {
  const { isAuthenticated, accessToken } = useUserAuth();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectChatSocket();
      return undefined;
    }
    getChatSocket(accessToken);
    return undefined;
  }, [isAuthenticated, accessToken]);

  return null;
}
