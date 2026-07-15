import { Router, type IRouter } from "express";
import healthRouter from "./health";
import arenaRouter from "./arena";
import leaderboardRouter from "./leaderboard";
import authRouter from "./auth";
import playersRouter from "./players";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/arena", arenaRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/auth", authRouter);
router.use("/players", playersRouter);
router.use("/admin", adminRouter);

export default router;
