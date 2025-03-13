import express from "express";
import { generateToken, verifyToken } from "../helpers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import { toUserRecordInput, toUserResponse } from "../mappers/users.js";
import { User } from "../models/connection.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  const body = req.body;
  const input = toUserRecordInput(body);
  const user = await User.create(input);
  console.log(user);
  const payload = toUserResponse(user);
  const token = generateToken(payload);
  res.status(201).json({ accessToken: token, refreshToken: "", test: body });
});

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    id: "1",
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    role: req.user.role,
  });
});

router.post("/login", (req, res) => {
  const body = req.body;
  if (body.password === "qwerty") {
    res.status(200).json({ accessToken: "", refreshToken: "", test: body });
  } else {
    res.status(401).json({ message: "wrong credentions" });
  }
});

router.post("/confirmRegistration", authMiddleware, (req, res) => {
  res.status(200).json({ accessToken: "", refreshToken: "" });
});

router.get("/resendCode", authMiddleware, (req, res) => {
  res.status(200).json({ status: "ok" });
});

// router.post("/forgotPassword", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

export default router;
