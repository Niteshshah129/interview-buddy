import express from "express";
import { getTheory, getQuiz, getPracticeQuestions } from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/theory", protect, getTheory);
router.post("/quiz", protect, getQuiz);
router.post("/practice", protect, getPracticeQuestions);

export default router;