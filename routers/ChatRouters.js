import express from "express";
import {
  createChat,
  getUserChats,
  createGroupChat,
} from "../controllers/ChatController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create 1-to-1 chat
router.post("/", verifyToken, createChat);

// Get all chats for the logged-in user
router.get("/", verifyToken, getUserChats);

// Create a group chat
router.post("/group", verifyToken, createGroupChat);

export default router;
