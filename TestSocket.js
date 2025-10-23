import { io } from "socket.io-client";

// 👇 Add userId to the query
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnectionAttempts: 3,
  query: {
    userId: "68f9e8e307e212d5ea3d5346", // 👈 your test user ID
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Optional test events
  socket.emit("joinChat", "chat123");
  socket.emit("sendMessage", {
    chatId: "chat123",
    text: "Hello World",
  });
});

socket.on("newMessage", (data) => {
  console.log("📩 Message received from server:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});