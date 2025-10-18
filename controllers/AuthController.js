import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { generateKeyPair } from "../utils/E2EE.js";

const SignUp = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address, role } = req.body;

    if (!name || !email || !password || !phoneNumber || !address) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { publicKey: PublicKey, privateKey: PrivateKey } = generateKeyPair();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      profilePhoto: req.file ? req.file.path : "default.jpg",
      role: role || "user",
      PublicKey,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.status(201).json({
      success: true,
      message: "✅ User registered successfully",
      token,
      PrivateKey,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        role: newUser.role,
        profilePhoto: newUser.profilePhoto,
        PrivateKey: newUser.PrivateKey,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.status(200).json({
      success: true,
      message: "✅ Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Logout Controller --------------------
const logout = async (req, res) => {
  try {
    // Since JWT is stateless, instruct client to remove token
    res.status(200).json({
      success: true,
      message: "✅ Logout successful. Please remove token from client.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { SignUp, loginUser, logout };
