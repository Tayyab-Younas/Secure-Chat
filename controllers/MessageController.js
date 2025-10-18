import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";
import crypto from "crypto";
import { Buffer } from "buffer";
import { encryptWithPublicKey, } from "../utils/E2EE.js";

// Send encrypted message
const SendMessage = async (req, res) => {
  try {
    const { chatId, text, recipientPublicKey } = req.body;

    if (!chatId || !text || !recipientPublicKey) {
      return res.status(400).json({
        success: false,
        message: "chatId, text and recipientPublicKey are required",
      });
    }

    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // 1️⃣ Generate random AES key for this message
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 2️⃣ Encrypt message with AES
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encryptedPayload = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("hex");

    // 3️⃣ Encrypt AES key with recipient's public key
    const encryptedKey = encryptWithPublicKey(recipientPublicKey, aesKey.toString("base64"));

    // 4️⃣ Save message
    const newMessage = await Message.create({
      senderId: req.user._id,
      chatId,
      encryptedPayload,
      iv: iv.toString("hex"),
      encryptedKey,
    });

    chatExists.latestMessage = newMessage._id;
    await chatExists.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("SendMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages (decrypted on client with private key)
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });

    // Messages are decrypted **on the client** using the recipient's private key
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { SendMessage, getMessages };
