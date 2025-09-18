import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { reviewRoutes } from "./reviewRoutes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/review", reviewRoutes);

export { router as apiRoutes };
