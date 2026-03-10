import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    getLeaderboard,
    getTeamLeaderboard,
    adjustScore
} from "../controllers/leaderboardController.js";

const router = Router();

router.get("/", getLeaderboard);
router.get("/teams/:id", getTeamLeaderboard);
router.post("/adjust", authMiddleware, adjustScore);

export default router;
