import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";
import User from "../models/UserModel.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  });

  io.on("connection", async (socket) => {
    console.log("✅ User connected:", socket.id);

    const userId = socket.handshake.query.userId;
    console.log("Socket connected with userId:", userId);
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { status: "online" });
      } catch (err) {
        console.error("❌ Error updating user status:", err.message);
      }
    }

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, senderId, encryptedPayload, iv, encryptedKey } = data;

        if (!chatId || !senderId || !encryptedPayload || !encryptedKey) {
          return socket.emit("error", { message: "Missing message data" });
        }

        const message = await Message.create({
          chatId,
          senderId,
          encryptedPayload,
          iv,
          encryptedKey,
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        io.to(chatId).emit("receiveMessage", message);
      } catch (err) {
        console.error("❌ Error saving message:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", async () => {
      console.log("❌ User disconnected:", socket.id);

      if (userId) {
        try {
          await User.findByIdAndUpdate(userId, {
            status: "offline",
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("❌ Error updating user status:", err.message);
        }
      }
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export { initSocket, getIO };
