import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateAvatar } from "../controllers/userController.js";

const router = express.Router();

router.put("/avatar", protect, updateAvatar);

export default router;
