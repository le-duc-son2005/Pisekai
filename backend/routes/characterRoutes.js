import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { selectCharacter, getMyCharacter } from "../controllers/characterController.js";

const router = express.Router();

// Simple health to verify router is mounted (no auth)
router.get("/health", (req, res) => res.json({ ok: true }));

// Select or change character for current user
router.post("/select", protect, selectCharacter);

// Get current user's character
router.get("/me", protect, getMyCharacter);

export default router;
