import mongoose from "mongoose";
import Key from "./models/KeyModel.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { Buffer } from "buffer";
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const lastKey = await Key.findOne().sort({ version: -1 });
    if (lastKey && lastKey.active) {
      console.log(`⚠️ Active key (v${lastKey.version}) already exists.`);
      await mongoose.disconnect();
      return;
    }

    const newVersion = lastKey ? lastKey.version + 1 : 1;
    const aesKey = crypto.randomBytes(32).toString("base64");
    console.log("🔑 Generated AES Key:", aesKey);

    // 🔐 Encrypt key with master key (optional)
    const MASTER_KEY = Buffer.from(process.env.MASTER_KEY, "base64");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(aesKey, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    const encryptedKey = JSON.stringify({
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encrypted.toString("base64"),
    });

    const keyDoc = await Key.create({
      version: newVersion,
      key: encryptedKey,
      active: true,
    });

    console.log(`✅ Key version ${newVersion} saved to DB`);
    await mongoose.disconnect();
    console.log("✅ Disconnected");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
