import "./helpers/env.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import apiSpec from "./openapi.js";
import cors from "cors";
import { errorHandler } from "./middlewares/error_handler.js";
import authRouter from "./routers/auth.js";
import sharedRouter from "./routers/shared.js";
import * as OpenApiValidator from "express-openapi-validator";

const PORT = process.env.PORT || 3000;
function loging(req, res, next) {
  console.log("Request received at:  ", req.url);
  next();
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

app.use(
  OpenApiValidator.middleware({
    apiSpec,
    validateRequests: true,
    validateResponses: false,
  })
);

app.use("/api/auth", loging, authRouter);

app.use("/api/shared", sharedRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});

export default app;
