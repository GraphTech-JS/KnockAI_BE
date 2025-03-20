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
import EmailService from "../services/email.js";
import {
  NotFoundUserError,
  WrongCredentialError,
} from "../middlewares/error_handler.js";
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
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = hash(verificationCode.toString());

    const userCreateInput = toUserRecordInput(req.body, hashedVerificationCode);
    const newUser = await User.create(userCreateInput);

    const emailContent = EmailService.generateConfirmRegistrationHtml(
      verificationCode,
      firstName,
      lastName
    );
    await EmailService.sendMessage(email, "Email confirmation", emailContent);
    const payload = toUserResponse(newUser);
    const tokens = generateTokensPair(payload);
    res.status(201).json(tokens);
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRecord = await User.findOne({ where: { user_id: userId } });
    if (!userRecord) {
      throw new NotFoundUserError();
    }
    const userResponse = toUserResponse(userRecord);
    res.status(200).json(userResponse);
  } catch (error) {
    return next(error);
  }
});

/**
 * body: {
    email: string
    password: string
  }
 */
router.post("/login", async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userRecord = await User.findOne({ where: { email } });
    const hashedPassword = hash(password);

    if (hashedPassword !== userRecord.password) {
      throw new WrongCredentialError();
    }

    const payload = toUserResponse(userRecord);
    const tokens = generateTokensPair(payload);
    res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

/* body: {
    code: string
  }
 */
router.post("/confirmRegistration", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRecord = await User.findOne({ where: { user_id: userId } });
    const code = req.body.code;
    const hashedVerificationCode = hash(code.toString());
    if (hashedVerificationCode !== userRecord.verification_code) {
      throw new WrongCredentialError();
    }
    const [updatedRowsCount, [user]] = await User.update(
      { verification_code: null, status: "VERIFIED" },
      { where: { user_id: userRecord.user_id }, returning: true }
    );

    if (updatedRowsCount === 0) {
      throw new NotFoundUserError();
    }

    const payload = toUserResponse(user);
    const tokens = generateTokensPair(payload);
    res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

/*
 * #TODO:
0. grep userId from req.user.userId
1. generate new code
2. hash this code
3. update user code into users table by userId 
4. send code via email
*/
router.get("/resendCode", authMiddleware, async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.user;
    const userId = req.user.userId;
    const userRecord = await User.findOne({ where: { user_id: userId } });
    if (!userRecord) {
      throw new NotFoundUserError();
    }

    const newVerificationCode = generateVerificationCode();
    const hashedVerificationCode = hash(newVerificationCode.toString());

    const emailContent = EmailService.generateConfirmRegistrationHtml(
      newVerificationCode,
      firstName,
      lastName
    );

    await EmailService.sendMessage(email, "Email confirmation", emailContent);

    const [updatedRowsCount, [user]] = await User.update(
      { verification_code: hashedVerificationCode },
      { where: { user_id: userRecord.user_id }, returning: true }
    );

    if (updatedRowsCount === 0) {
      throw new NotFoundUserError();
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return next(error);
  }
});

//write docs for refreshToken -> see an example openapi.js
router.post("/refreshToken", async (req, res, next) => {
  const receivedToken = req.body.refreshToken;
  if (!receivedToken) {
    throw new WrongCredentialError();
  }
  try {
    const decoded = verifyToken(receivedToken);
    const userRecord = await User.findOne({
      where: { user_id: decoded.userId },
    });

    if (!userRecord) {
      throw new NotFoundUserError(decoded.userId);
    }

    const userResponse = toUserResponse(userRecord);

    const newAccessTokens = generateTokensPair(userResponse);

    res.status(200).json(newAccessTokens);
  } catch (error) {
    return next(error);
  }
});

/**
 * follow the next structure (pattern) for routers (please review current routers and change it)
 * Let's handle errors in one place middleware/error_handler.js (errorHandler) 
 * 
 * router.post("/example", async (req, res, next) => {
  try {

    //your code here

    if(<condition>){
  
    // res.status(401).json({ ... }); << DO NOT USE IT HERE

      throw new Error(...) << HERE IS BETTER
    }

    //your code here
    
    return res.status(200).json(...);
  } catch (error) {

    // res.status(401).json({ message }); << DO NOT USE IT HERE

    return next(error) << HERE IS BETTER << after this, it handles into middleware/error_handler.js (errorHandler)  
  }
});
 * 
 */
export default router;
