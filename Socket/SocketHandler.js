import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Join a chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`🔹 Socket ${socket.id} joined chat: ${chatId}`);
    });

    // Receive encrypted message
    socket.on("sendMessage", async (data) => {
      try {
        if (!data.chatId || !data.senderId || !data.encryptedPayload) {
          return socket.emit("error", { message: "Missing message data" });
        }

        // Save encrypted message
        const message = await Message.create({
          chatId: data.chatId,
          senderId: data.senderId,
          encryptedPayload: data.encryptedPayload,
          iv: data.iv,
          authTag: data.authTag,
          keyVersion: data.keyVersion || 1,
        });

        // Update latestMessage in chat
        await Chat.findByIdAndUpdate(data.chatId, {
          latestMessage: message._id,
        });

        // Populate for client use
        const populatedMessage = await message.populate([
          { path: "senderId", select: "username email" },
          { path: "chatId" },
        ]);

        // Broadcast encrypted message to all participants
        io.to(data.chatId).emit("receiveMessage", populatedMessage);

        console.log("📩 Encrypted message sent to room:", data.chatId);
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
