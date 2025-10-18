import User from "../models/UserModel.js";

export const rotateKey = async (req, res) => {
  try {
    const { newPublicKey } = req.body;

    if (!newPublicKey) {
      return res.status(400).json({ success: false, message: "New public key is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Save old key for backward decryption
    if (user.PublicKey) {
      user.oldPublicKeys.push(user.PublicKey);
    }

    // Update with new key
    user.PublicKey = newPublicKey;

    await user.save();

    res.status(200).json({
      success: true,
      message: "🔑 Public key rotated successfully",
      data: {
        userId: user._id,
        currentKey: user.PublicKey,
        oldKeysCount: user.oldPublicKeys.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
