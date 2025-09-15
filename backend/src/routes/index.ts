import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { authRoutes } from "./authRoutes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/submit", (req: Request, res: Response, next: NextFunction) => {
  console.log("Submit routes called");
});

export { router as apiRoutes };
