import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserProfile);
router.put("/", protect, updateUserProfile);

export default router;