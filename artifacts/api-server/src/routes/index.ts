import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import arenaRouter from "./arena";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/arena", arenaRouter);
router.use("/leaderboard", leaderboardRouter);

export default router;
