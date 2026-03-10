import { Router } from "express";
import { authMiddleware, teamAuthMiddleware } from "../middleware/authMiddleware.js";
import {
    createSubmission,
    getByTeam,
    getByQuestion,
    updateSubmission,
    deleteSubmission
} from "../controllers/round1SubmissionCrudController.js";

const router = Router();

router.post("/", teamAuthMiddleware, createSubmission);
router.get("/team/:id", authMiddleware, getByTeam);
router.get("/question/:id", authMiddleware, getByQuestion);
router.put("/:id", authMiddleware, updateSubmission);
router.delete("/:id", authMiddleware, deleteSubmission);

export default router;
