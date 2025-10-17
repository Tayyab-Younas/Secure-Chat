import Chat from "../models/ChatModel.js";

// ✅ Create a new 1-to-1 chat
const createChat = async (req, res) => {
  try {
    const { members } = req.body;

    if (!members || members.length < 2)
      return res.status(400).json({ message: "At least 2 members required" });

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: members, $size: 2 },
    });

    if (existingChat) return res.status(200).json(existingChat);

    const newChat = await Chat.create({ members, isGroupChat: false });
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Fetch all user chats
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "username email PublicKey")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a group chat
const createGroupChat = async (req, res) => {
  try {
    const { members, groupName } = req.body;

    if (!members || members.length < 2) {
      return res
        .status(400)
        .json({ message: "A group must have at least 2 members" });
    }

    const newGroupChat = await Chat.create({
      members,
      groupName,
      isGroupChat: true,
    });

    res.status(201).json(newGroupChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { createChat, getUserChats, createGroupChat };
