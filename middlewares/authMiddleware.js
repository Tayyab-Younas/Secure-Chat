import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET not defined in environment variables");
    }

    // Verify token
    const decoded = jwt.verify(token, secret);

    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    req.user = { _id: decoded.id };

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};

export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required to login.",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error validating login input.",
      error: err.message,
    });
  }
};

