import express from "express";
import { getQuestions, seedQuestions } from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getQuestions);
router.post("/seed", seedQuestions);

export default router;