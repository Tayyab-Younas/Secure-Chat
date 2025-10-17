import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // backend server address

// connect once and reuse the same instance
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // faster, avoids polling
});

export default socket;
