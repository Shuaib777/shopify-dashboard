import jwt from "jsonwebtoken";

const generateToken = (tenantId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ tenantId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("tenantToken", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "",
  });

  return token;
};

export default generateToken;
