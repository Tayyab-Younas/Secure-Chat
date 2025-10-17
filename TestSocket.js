// TestSocket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnectionAttempts: 3,
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Join a test chat room
  socket.emit("joinChat", "chat123");

  // Send a test plain text message
  socket.emit("sendMessage", {
    chatId: "chat123",
    text: "Hello World",
  });
});

// Listen to messages from the server
socket.on("newMessage", (data) => {
  console.log("📩 Message received from server:", data);
});

// Clean up listeners on disconnect
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

// Handle connection errors
socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
