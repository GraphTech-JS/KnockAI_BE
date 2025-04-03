import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { Readable } from "stream";
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

//hardcoded
const creds = process.env.GOOGLE_ACCOUNT_CREDS
  ? JSON.parse(process.env.GOOGLE_ACCOUNT_CREDS)
  : {};
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

router.post(
  "/upload",
  multer({ storage: multer.memoryStorage() }).single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileStream = new Readable();
      fileStream.push(req.file.buffer);
      fileStream.push(null);

      const file = await drive.files.create({
        requestBody: {
          name: req.file.originalname,
        },
        media: {
          mimeType: req.file.mimetype,
          body: fileStream,
        },
      });

      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      res.json({
        fileId: file.data.id,
        message:
          "File uploaded successfully || only for dev env, unstable api, usse s3 instead",
        url: `https://lh3.google.com/u/0/d/${file.data.id}`,
      });
    } catch (err) {
      next(err);
    }
  }
);
export default router;
