import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { rotateKey } from "../controllers/KeyRotationController.js";

const router = express.Router();

// Rotate user's public key
router.put("/rotate", verifyToken, rotateKey);

export default router;
