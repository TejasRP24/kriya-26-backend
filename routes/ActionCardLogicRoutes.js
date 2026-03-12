import { Router } from "express";
import { getActionCards, getPlayerCards, activateCard } from "../controllers/ActionCardLogicController.js";
import { teamAuthMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Public route to view all card definitions
router.get("/actionCards", getActionCards);

// Protected routes for players
// Using kriyaID instead of playerId as requested
router.get("/players/:kriyaID/cards", teamAuthMiddleware, getPlayerCards);
router.post("/players/:kriyaID/cards/:cardId/use", teamAuthMiddleware, activateCard);

export default router;
