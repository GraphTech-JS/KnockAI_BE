import express from "express";
import { generateToken, verifyToken } from "../helpers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import { toUserRecordInput, toUserResponse } from "../mappers/users.js";
import { User } from "../models/connection.js";
import { hash } from "../helpers/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const body = req.body;
  const input = toUserRecordInput(body);
  const user = await User.create(input);
  console.log(user);
  const payload = toUserResponse(user);
  const token = generateToken(payload);
  res.status(201).json({ accessToken: token, refreshToken: "" });
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRecord = await User.findOne({ where: { user_id: userId } });
    const userResponse = toUserResponse(userRecord);
    res.status(200).json(userResponse);
  } catch (error) {}
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userRecord = await User.findOne({ where: { email } });
    const hashedPassword = hash(password);

    if (hashedPassword !== userRecord.password) {
      throw new Error();
    }

    const payload = toUserResponse(userRecord);
    const token = generateToken(payload);
    res.status(200).json({ accessToken: token, refreshToken: "" });
  } catch (error) {
    res.status(401).json({ error: "wrong credentials" });
  }
});

router.post("/confirmRegistration", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  //   const userRecord = await User.findOne({ where: { user_id: userId } });
  await User.update(
    { status: "VERIFIED" },
    {
      where: {
        user_id: userId,
      },
    }
  );
  const userRecord = await User.findOne({ where: { user_id: userId } });
  const payload = toUserResponse(userRecord);
  const token = generateToken(payload);
  res.status(200).json({ accessToken: token, refreshToken: "" });
});

router.get("/resendCode", authMiddleware, (req, res) => {
  res.status(200).json({ status: "ok" });
});

// router.post("/forgotPassword", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

export default router;
