import express from "express";
import { politicalAffiliationEnum } from "../helpers/constants.js";
const router = express.Router();

router.get("/politicalAffiliation", (req, res, next) => {
  try {
    const keyValueArray = Object.entries(politicalAffiliationEnum);
    const result = keyValueArray.map((keyValue) => ({
      key: keyValue[0],
      value: keyValue[1],
    }));
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});
export default router;
