import crypto from "crypto";
import { Buffer } from "buffer";

// 🔐 Generate RSA key pair (2048 or 4096 bits)
 function generateKeyPair(passphrase = "") {
  const privateKeyEncoding = {
    type: "pkcs8",
    format: "pem",
  };

  if (passphrase) {
    privateKeyEncoding.cipher = "aes-256-cbc";
    privateKeyEncoding.passphrase = passphrase;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096, // stronger keys
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding,
  });

  return { publicKey, privateKey };
}

// 🔐 Encrypt message with recipient’s public key using RSA-OAEP
 function encryptWithPublicKey(publicKey, message) {
  if (!publicKey.includes("BEGIN PUBLIC KEY")) {
    throw new Error("Invalid public key");
  }

  const buffer = Buffer.from(message, "utf8");
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  return encrypted.toString("base64");
}

// 🔐 Decrypt with private key (and optional passphrase)
 function decryptWithPrivateKey(privateKey, encryptedMessage, passphrase = "") {
  const buffer = Buffer.from(encryptedMessage, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  return decrypted.toString("utf8");
}

// 🔑 Optional: Generate a new AES-256 key (for symmetric encryption)
 function generateAESKey() {
  return crypto.randomBytes(32).toString("base64");
}
export { generateKeyPair, encryptWithPublicKey, decryptWithPrivateKey, generateAESKey };