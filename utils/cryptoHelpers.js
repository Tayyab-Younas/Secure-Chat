import crypto from "crypto";
import { Buffer } from "buffer";
import Key from "../models/KeyModel.js";

// Encrypt message with AES, return encrypted payload + iv + key version
const encryptMessage = async (plainText) => {
  const currentKeyDoc = await Key.findOne().sort({ version: -1 });
  if (!currentKeyDoc) throw new Error("No encryption key found");

  const key = Buffer.from(currentKeyDoc.key, "hex");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);

  return {
    encryptedPayload: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    keyVersion: currentKeyDoc.version, // useful for rotation
  };
};

// Decrypt message with AES and specific key version
const decryptMessage = async (encryptedPayload, ivHex, keyVersion) => {
  const keyDoc = await Key.findOne({ version: keyVersion });
  if (!keyDoc) throw new Error(`Encryption key not found for version ${keyVersion}`);

  const key = Buffer.from(keyDoc.key, "hex");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};


export { encryptMessage, decryptMessage };