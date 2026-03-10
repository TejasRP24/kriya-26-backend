import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createCard,
    getCards,
    getCard,
    updateCard,
    deleteCard
} from "../controllers/AlgorithmCardController.js";

const router = Router();

router.post("/", authMiddleware, createCard);
router.get("/", getCards);
router.get("/:id", getCard);
router.put("/:id", authMiddleware, updateCard);
router.delete("/:id", authMiddleware, deleteCard);

export default router;
