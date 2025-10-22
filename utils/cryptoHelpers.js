import crypto from "crypto";
import { Buffer } from "buffer";
import Key from "../models/KeyModel.js";

// Encrypt message with AES-GCM (authenticated encryption)
 const encryptMessage = async (plainText) => {
  const currentKeyDoc = await Key.findOne().sort({ version: -1 });
  if (!currentKeyDoc) throw new Error("No encryption key found");

  const key = Buffer.from(currentKeyDoc.key, "base64");
  const iv = crypto.randomBytes(12); // 96-bit nonce
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedPayload: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyVersion: currentKeyDoc.version,
  };
};

// Decrypt message with AES-GCM
 const decryptMessage = async (encryptedPayload, ivBase64, authTagBase64, keyVersion) => {
  const keyDoc = await Key.findOne({ version: keyVersion });
  if (!keyDoc) throw new Error(`Encryption key not found for version ${keyVersion}`);

  if (keyDoc.version !== keyVersion) {
    throw new Error("Key version mismatch — possible tampering detected");
  }

  const key = Buffer.from(keyDoc.key, "base64");
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPayload, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

// Optional helper for generating new AES keys
 const generateKey = () => {
  return crypto.randomBytes(32).toString("base64"); // AES-256 key
};


export { encryptMessage, decryptMessage, generateKey };