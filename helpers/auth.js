import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const secretKey = "your-secret-key";

export function generateToken(payload) {
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  console.log("Generated Token:", token);
  return token;
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded Token:", decoded);
    return decoded;
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return null;
  }
}

export function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}

export function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000);
}
