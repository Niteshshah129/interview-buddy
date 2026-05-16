import express from "express";
import { uploadResume, getUserResumes, deleteResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume as resumeUpload } from "../config/multer.js";

const router = express.Router();

router.post("/upload", protect, resumeUpload.single("resume"), uploadResume);
router.get("/my", protect, getUserResumes);
router.delete("/:id", protect, deleteResume);

export default router;