import express from "express";
import { SignUp, loginUser, logout } from "../controllers/AuthController.js";
import upload from "../middlewares/UploadMiddleware.js";

const router = express.Router();

// Register
router.post("/signup", upload.single("profilePhoto"), SignUp);

// Login
router.post("/login", loginUser);

router.post("/logout", logout);

export default router;
