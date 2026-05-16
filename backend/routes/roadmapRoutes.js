import express from "express";
import {
  generateRoadmap,
  getMyRoadmaps,
  getRoadmapById,
  updateProgress,
  deleteRoadmap,
} from "../controllers/roadmapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateRoadmap);
router.get("/my", protect, getMyRoadmaps);
router.get("/:id", protect, getRoadmapById);
router.put("/:id/progress", protect, updateProgress);
router.delete("/:id", protect, deleteRoadmap);

export default router;