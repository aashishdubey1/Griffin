import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

const router = Router();

router.use("/submit", (req: Request, res: Response, next: NextFunction) => {
  console.log("Submit routes called");
});

export default router;
  