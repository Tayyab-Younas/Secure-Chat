import express from "express";
import { SignUp, loginUser } from "../controllers/AuthController.js";
import upload from "../middlewares/UploadMiddleware.js";

const router = express.Router();

// Register
router.post("/signup", upload.single("profilePhoto"), SignUp);

// Login
router.post("/login", loginUser);

export default router;
