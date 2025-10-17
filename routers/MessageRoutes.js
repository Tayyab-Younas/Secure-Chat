import express from "express";
import { SendMessage, getMessages } from "../controllers/MessageController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",verifyToken, SendMessage);
router.get("/:chatId",verifyToken, getMessages);

export default router;
