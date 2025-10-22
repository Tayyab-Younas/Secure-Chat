import jwt from "jsonwebtoken";


const generateToken = (id, type = "access") => {
  const expiresIn =
    process.env.JWT_EXPIRE || (type === "access" ? "7d" : "30d");

  const payload = {
    userId: id,
    type,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export default generateToken;
