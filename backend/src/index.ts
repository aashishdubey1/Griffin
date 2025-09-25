import express, {
  urlencoded,
  type Express,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";

import serverConfig from "./config/server.config";
import logger from "./config/logger.config";
import { apiRoutes } from "./routes";
import { connectToDb } from "./config/db.config";
import mongoose from "mongoose";

const app: Express = express();

await connectToDb();

app.set("trust proxy", true);

app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.get("/health", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ success: true, message: "OK" });
});

app.use("/api", apiRoutes);

app.listen(serverConfig.PORT, async () => {
  logger.info(`server is running on port ${serverConfig.PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});
