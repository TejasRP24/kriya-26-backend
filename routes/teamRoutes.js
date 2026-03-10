import { Router } from "express";
import { teamAuthMiddleware } from "../middleware/authMiddleware.js";
import { login, logout } from "../controllers/teamAuthController.js";
import {
    chooseShipConfig,
    round1Answers,
    round2Answers,
    selectActionCards,
    useActionCard,
    deleteRound1Answer,
    deleteRound2Answer,
    updateAnswer,
    getProfile,
    getProgress
} from "../controllers/teamController.js";

const router = Router();

// Auth
router.post("/login", login);
router.post("/logout", teamAuthMiddleware, logout);

// Ship config
router.post("/choose-shipconfig", teamAuthMiddleware, chooseShipConfig);

// Round answers
router.post("/round1answers", teamAuthMiddleware, round1Answers);
router.post("/round2answers", teamAuthMiddleware, round2Answers);

// Action cards
router.post("/select-action-cards", teamAuthMiddleware, selectActionCards);
router.post("/use-action-card", teamAuthMiddleware, useActionCard);

// Delete / Update answers
router.delete("/round1answers/:id", teamAuthMiddleware, deleteRound1Answer);
router.delete("/round2answers/:id", teamAuthMiddleware, deleteRound2Answer);
router.put("/answers/:id", teamAuthMiddleware, updateAnswer);

// Profile & Progress
router.get("/profile/:id", teamAuthMiddleware, getProfile);
router.get("/progress/:id", teamAuthMiddleware, getProgress);

export default router;
