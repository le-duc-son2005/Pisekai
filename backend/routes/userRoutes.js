import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, updateAvatar } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/avatar", protect, updateAvatar);

export default router;
