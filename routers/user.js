import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { toUpdateUserProfileInput, toUserResponse } from "../mappers/users.js";
import { User } from "../models/connection.js";
import EmailService from "../services/email.js";
import {
  NotFoundUserError,
  WrongCredentialError,
} from "../middlewares/error_handler.js";

const router = express.Router();

/*
body: {
firstName
lastName
password
politicalAffiliation
}
*/
router.patch("/updateProfile", authMiddleware, async (req, res, next) => {
  try {
    const body = req.body;
    const userRecord = await User.findOne({
      where: { user_id: req.user.userId },
    });

    if (!userRecord) {
      throw new NotFoundUserError();
    }

    const updateProfileInput = toUpdateUserProfileInput(body);

    const [_updatedRowsCount, [user]] = await User.update(updateProfileInput, {
      where: { user_id: userRecord.user_id },
      returning: true,
    });

    return res.status(200).json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
});

export default router;
