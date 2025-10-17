// createKey.js
import mongoose from "mongoose";
import Key from "./models/KeyModel.js"; // adjust path if needed
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");

    // 2️⃣ Check if a key already exists
    const exists = await Key.findOne();
    if (exists) {
      console.log("⚠️ Key already exists:", exists);
      await mongoose.disconnect();
      return;
    }

    // 3️⃣ Generate 32-byte random key (AES-256)
    const keyHex = crypto.randomBytes(32).toString("hex");
    console.log("🔑 Generated Key:", keyHex);

    // 4️⃣ Save key to DB
    const keyDoc = await Key.create({ version: 1, key: keyHex });
    console.log("✅ Key saved to DB:", keyDoc);

    // 5️⃣ Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};

run();
