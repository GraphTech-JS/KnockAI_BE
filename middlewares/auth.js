import { verifyToken } from "../helpers/auth.js";

export function authMiddleware(req, res, next) {
  try {
    const authheader = req.headers.authorization;

    if (!authheader) {
      throw new Error();
    }

    const [_, token] = authheader.split(" ");

    if (!token) {
      throw new Error();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error();
    }
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}
