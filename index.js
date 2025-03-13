import express from "express";
import authRouter from "./routers/auth.js";

function loging(req, res, next) {
  console.log("Request received at:  ", req.url);
  next();
}

const app = express();

app.use(express.json());

app.use("/api/auth", loging, authRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
