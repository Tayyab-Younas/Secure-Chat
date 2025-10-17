import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";
import Key from "../models/KeyModel.js";
import crypto from "crypto";
import { Buffer } from "buffer";

// ------------------- Crypto Helpers -------------------

// Encrypt a message with the latest key
const encryptMessage = async (plainText) => {
  const currentKeyDoc = await Key.findOne().sort({ version: -1 });
  if (!currentKeyDoc) throw new Error("No encryption key found");

  const key = Buffer.from(currentKeyDoc.key, "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedPayload: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    keyVersion: currentKeyDoc.version, // <-- latest key version
  };
};

// Decrypt a message using its key version
const decryptMessage = async (encryptedPayload, ivHex, keyVersion) => {
  const keyDoc = await Key.findOne({ version: keyVersion });
  if (!keyDoc) throw new Error("Encryption key not found for this version");

  const key = Buffer.from(keyDoc.key, "hex");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

// ------------------- Chat Controllers -------------------

// Send Encrypted Message
const SendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({
        success: false,
        message: "chatId and text are required",
      });
    }

    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Encrypt message using the latest key
    const { encryptedPayload, iv, keyVersion } = await encryptMessage(text);

    const newMessage = await Message.create({
      senderId: req.user._id,
      chatId,
      encryptedPayload,
      iv,
      keyVersion,
    });

    chatExists.latestMessage = newMessage._id;
    await chatExists.save();

    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "username email" },
      { path: "chatId", select: "members isGroupChat" },
    ]);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SendMessage error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Messages in a Chat (decrypted)
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    // Decrypt each message using its keyVersion
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => ({
        ...msg.toObject(),
        content: await decryptMessage(
          msg.encryptedPayload,
          msg.iv,
          msg.keyVersion
        ),
      }))
    );

    res.status(200).json({
      success: true,
      count: decryptedMessages.length,
      messages: decryptedMessages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export { SendMessage, getMessages };
