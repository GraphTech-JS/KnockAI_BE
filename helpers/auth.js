import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const secretKey = "your-secret-key";

export function generateToken(payload, expiresIn = "1h") {
  const accessToken = jwt.sign(payload, secretKey, { expiresIn });
  console.log("Generated Token:", accessToken);
  return accessToken;
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
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateTokensPair(payload) {
  const accessToken = generateToken(payload);
  const refreshToken = generateToken(payload, "1d");
  return { accessToken, refreshToken };
}
