import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createRound2Question,
    getRound2Questions,
    getRound2Question,
    updateRound2Question,
    deleteRound2Question
} from "../controllers/round2questionsController.js";

const router = Router();

router.post("/questions", authMiddleware, createRound2Question);
router.get("/questions", getRound2Questions);
router.get("/questions/:id", getRound2Question);
router.put("/questions/:id", authMiddleware, updateRound2Question);
router.delete("/questions/:id", authMiddleware, deleteRound2Question);

export default router;
