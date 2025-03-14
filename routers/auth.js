import express from "express";
import { generateToken, verifyToken } from "../helpers/auth.js";
import { authMiddleware } from "../middlewares/auth.js";
import { toUserRecordInput, toUserResponse } from "../mappers/users.js";
import { User } from "../models/connection.js";
import { hash } from "../helpers/auth.js";

const router = express.Router();

/**
 * #TODO:
 * 0.Add new field (code: string) to db (see models->users.js)
 * 1.generate code
 * 2.hash(code)
 * 3.put hashed code for user which is creating
 * 4.send code via email
 */
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
    const token = generateToken(payload);
    res.status(200).json({ accessToken: token, refreshToken: "" });
  } catch (error) {
    res.status(401).json({ error: "wrong credentials" });
  }
});

/**
 * #TODO:
 * 1. grep code from body
 * 2. select user from table by userid
 * 3. hash(code)
 * 4. compare it with code from userRecord
 * 5. if true -> update user with status: VERIFIED, code: null
 *
 * #TODO:
 * 1.optimize User.update query (use returning: true)
 */
/**
 * body: {
    code: string
  }
 */
router.post("/confirmRegistration", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  //   const userRecord = await User.findOne({ where: { user_id: userId } });
  await User.update(
    { status: "VERIFIED", code: null },
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

/*
 * #TODO:
0. grep userId from req.user.userId
1. generate new code
2. hash this code
3. update user code into users table by userId 
4. send code via email
*/
router.get("/resendCode", authMiddleware, (req, res) => {
  res.status(200).json({ status: "ok" });
});

// router.post("/forgotPassword", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

export default router;
