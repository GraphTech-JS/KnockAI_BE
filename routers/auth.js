import express from "express";
import {
  generateToken,
  generateVerificationCode,
  hash,
  generateTokensPair,
} from "../helpers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import { toUserRecordInput, toUserResponse } from "../mappers/users.js";
import { User } from "../models/connection.js";

const router = express.Router();

/**
 * body: {
    firstName: string
    lastName: string
    email: string
    role: string
    politicalAffiliation: string
    password: string
  }
 */
router.post("/register", async (req, res) => {
  try {
    const verificationCode = generateVerificationCode();
    console.log(verificationCode);
    const hashedVerificationCode = hash(verificationCode.toString());

    const userCreateInput = toUserRecordInput(req.body, hashedVerificationCode);
    const newUser = await User.create(userCreateInput);
    const payload = toUserResponse(newUser);
    const tokens = generateTokensPair(payload);
    res.status(201).json(tokens);
  } catch (error) {
    res.status(401).json({ error: "wrong credentials" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRecord = await User.findOne({ where: { user_id: userId } });
    const userResponse = toUserResponse(userRecord);
    res.status(200).json(userResponse);
  } catch (error) {}
});

/**
 * body: {
    email: string
    password: string
  }
 */
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
    const tokens = generateTokensPair(payload);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ error: "wrong credentials" });
  }
});

/* body: {
    code: string
  }
 */
router.post("/confirmRegistration", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const userRecord = await User.findOne({ where: { user_id: userId } });
  const code = req.body.code;
  const hashedVerificationCode = hash(code.toString());
  if (hashedVerificationCode !== userRecord.verification_code) {
    return res.status(400).json({ error: "Invalid verification code." });
  }
  const [updatedRowsCount, [user]] = await User.update(
    { verification_code: null, status: "VERIFIED" },
    { where: { user_id: userRecord.user_id }, returning: true }
  );

  if (updatedRowsCount === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  const payload = toUserResponse(user);
  const tokens = generateTokensPair(payload);
  res.status(200).json(tokens);
});

/*
 * #TODO:
0. grep userId from req.user.userId
1. generate new code
2. hash this code
3. update user code into users table by userId 
4. send code via email
*/
router.get("/resendCode", authMiddleware, async (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/forgotPassword", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/refreshToken", async (req, res) => {
  const receivedToken = req.body.refreshToken;
  if (!receivedToken) {
    return res.status(401).json({ error: "Refresh token is required." });
  }
  try {
    const decoded = verifyToken(receivedToken);
    const userRecord = await User.findOne({
      where: { user_id: decoded.userId },
    });

    if (!userRecord) {
      return res.status(401).json({ message });
    }

    const userResponse = toUserResponse(userRecord);

    const newAccessTokens = generateTokensPair(userResponse);

    res.status(200).json(newAccessTokens);
  } catch (error) {
    return res.status(401).json({ message });
  }
});
export default router;
