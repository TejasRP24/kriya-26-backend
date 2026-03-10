import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createRound1Question,
    getRound1Questions,
    getRound1Question,
    updateRound1Question,
    deleteRound1Question
} from "../controllers/round1questionsController.js";

const router = Router();

router.post("/questions", authMiddleware, createRound1Question);
router.get("/questions", getRound1Questions);
router.get("/questions/:id", getRound1Question);
router.put("/questions/:id", authMiddleware, updateRound1Question);
router.delete("/questions/:id", authMiddleware, deleteRound1Question);

export default router;
