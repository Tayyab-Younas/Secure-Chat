import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";

// ------------------- Chat Controllers for E2EE -------------------

// Send Message (server stores only encryptedPayload)
const SendMessage = async (req, res) => {
  try {
    const { chatId, senderId, encryptedPayload, iv } = req.body;

    if (!chatId || !senderId || !encryptedPayload) {
      return res.status(400).json({
        success: false,
        message: "chatId, senderId, and encryptedPayload are required",
      });
    }

    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const newMessage = await Message.create({
      senderId,
      chatId,
      encryptedPayload,
      iv,
    });

    chatExists.latestMessage = newMessage._id;
    await chatExists.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: newMessage._id,
        chatId: newMessage.chatId,
        senderId: newMessage.senderId,
        encryptedPayload: newMessage.encryptedPayload,
        iv: newMessage.iv,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("SendMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Messages (server returns only encrypted messages)
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.map(msg => ({
        messageId: msg._id,
        chatId: msg.chatId,
        senderId: msg.senderId,
        encryptedPayload: msg.encryptedPayload,
        iv: msg.iv,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { SendMessage, getMessages };
