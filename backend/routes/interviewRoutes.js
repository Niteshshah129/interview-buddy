import express from "express";
import {
  saveInterview,
  getMyInterviews,
  deleteInterview,
  getInterviewById,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveInterview);
router.get("/my", protect, getMyInterviews);
router.get("/detail/:id", protect, getInterviewById);
router.delete("/:id", protect, deleteInterview);

export default router;