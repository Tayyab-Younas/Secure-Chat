import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, senderId, encryptedPayload, iv, encryptedKey } = data;

        if (!chatId || !senderId || !encryptedPayload || !encryptedKey) {
          return socket.emit("error", { message: "Missing message data" });
        }

        // Save encrypted message
        const message = await Message.create({
          chatId,
          senderId,
          encryptedPayload,
          iv,
          encryptedKey,
        });

        // Update latestMessage
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        // Send only to participants
        io.to(chatId).emit("receiveMessage", message);
      } catch (err) {
        console.error("❌ Error saving message:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export { initSocket, getIO };
