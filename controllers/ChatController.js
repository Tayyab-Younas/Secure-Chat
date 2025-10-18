import Chat from "../models/ChatModel.js";

// Create 1-to-1 chat
const createChat = async (req, res) => {
  try {
    const { members } = req.body;

    if (!members || members.length < 2) {
      return res.status(400).json({ success: false, message: "At least 2 members required" });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: members, $size: 2 },
    });

    if (existingChat) return res.status(200).json({ success: true, chat: existingChat });

    const newChat = await Chat.create({ members, isGroupChat: false });
    res.status(201).json({ success: true, chat: newChat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch all chats for logged-in user
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "name email PublicKey")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: chats.length, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { members, groupName } = req.body;

    if (!members || members.length < 2) {
      return res.status(400).json({ success: false, message: "A group must have at least 2 members" });
    }

    const newGroupChat = await Chat.create({
      members,
      groupName,
      isGroupChat: true,
    });

    res.status(201).json({ success: true, chat: newGroupChat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { createChat, getUserChats, createGroupChat };
