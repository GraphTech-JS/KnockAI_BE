import { verifyToken } from "../helpers/auth.js";
import { UnauthorizedError } from "./error_handler.js";

export function authMiddleware(req, res, next) {
  try {
    const authheader = req.headers.authorization;

    if (!authheader) {
      throw new UnauthorizedError();
    }

    const [_, token] = authheader.split(" ");

    if (!token) {
      throw new Error();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedError();
    }
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}
