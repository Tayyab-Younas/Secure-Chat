import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Join multiple chat rooms
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // Send encrypted message
    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, senderId, encryptedPayload, iv } = data;

        if (!chatId || !senderId || !encryptedPayload) {
          return socket.emit("error", {
            success: false,
            message: "Missing message data",
          });
        }

        // Save message (server cannot decrypt)
        const message = await Message.create({
          chatId,
          senderId,
          encryptedPayload,
          iv,
        });

        // Update latestMessage in chat
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        // Forward encrypted message to all participants in chat
        io.to(chatId).emit("receiveMessage", {
          messageId: message._id,
          chatId,
          senderId,
          encryptedPayload,
          iv,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit("error", { success: false, message: err.message });
      }
    });

    socket.on("disconnect", () => {});
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export { initSocket, getIO };
