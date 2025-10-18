import crypto from "crypto";
import { Buffer } from "buffer";

export function generateKeyPair(passphrase = "") {
  // Prepare privateKeyEncoding object
  const privateKeyEncoding = {
    type: "pkcs8",
    format: "pem",
  };

  // Only add cipher & passphrase if provided
  if (passphrase) {
    privateKeyEncoding.cipher = "aes-256-cbc";
    privateKeyEncoding.passphrase = passphrase;
  }

  // Generate RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding,
  });
  return { publicKey, privateKey };
}

/**
 * Encrypt a message with a recipient's public key
 */
export function encryptWithPublicKey(publicKey, message) {
  const buffer = Buffer.from(message, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

/**
 * Decrypt a message with your private key
 */
export function decryptWithPrivateKey(
  privateKey,
  encryptedMessage,
  passphrase = ""
) {
  const buffer = Buffer.from(encryptedMessage, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase,
    },
    buffer
  );
  return decrypted.toString("utf8");
}
