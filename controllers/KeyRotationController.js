import User from "../models/UserModel.js";

// Rotate user's public key
export const rotateKey = async (req, res) => {
  try {
    const { newPublicKey } = req.body;

    // ✅ Validate new public key
    if (
      !newPublicKey ||
      !newPublicKey.startsWith("-----BEGIN PUBLIC KEY-----")
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing public key" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Save old key for backward decryption
    if (user.PublicKey) {
      user.oldPublicKeys.push(user.PublicKey);
    }

    // Update public key and increment version
    user.PublicKey = newPublicKey;
    user.keyVersion = (user.keyVersion || 1) + 1;

    await user.save();

    res.status(200).json({
      success: true,
      message: "🔑 Public key rotated successfully",
      data: {
        userId: user._id,
        currentKey: user.PublicKey,
        keyVersion: user.keyVersion,
        oldKeysCount: user.oldPublicKeys.length,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message });
  }
};
