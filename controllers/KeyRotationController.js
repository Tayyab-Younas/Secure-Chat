import User from "../models/UserModel.js";
import { generateKeyPair } from "../utils/E2EE.js";

export const rotateKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate new RSA key pair
    const { publicKey: newPublicKey, privateKey: newPrivateKey } = generateKeyPair();

    // Save current public key to old keys array for backward compatibility
    if (user.PublicKey) {
      user.oldPublicKeys.push(user.PublicKey);
    }

    // Update with new public key
    user.PublicKey = newPublicKey;

    await user.save();

    // Return new private key to client (store securely on client-side)
    res.status(200).json({
      success: true,
      message: "🔑 Key rotated successfully",
      data: {
        userId: user._id,
        currentPublicKey: user.PublicKey,
        oldKeysCount: user.oldPublicKeys.length,
        privateKey: newPrivateKey, // Send new private key to client
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
