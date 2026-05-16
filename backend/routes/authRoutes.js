import express from "express";
import {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateAvatar,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../config/multer.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/profile/avatar", protect, uploadAvatar.single("avatar"), updateAvatar);

export default router;