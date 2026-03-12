import { Router } from "express";
import { submitSolution, minigameComplete } from "../controllers/GameLogicController.js";
import { teamAuthMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Protected routes for game actions
router.post("/players/:kriyaID/submit", teamAuthMiddleware, submitSolution);
router.post("/players/:kriyaID/minigame-complete", teamAuthMiddleware, minigameComplete);

export default router;
