import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { selectCharacter, getMyCharacter, getCharacterClasses } from "../controllers/characterController.js";

const router = express.Router();

// Simple health to verify router is mounted (no auth)
router.get("/health", (req, res) => res.json({ ok: true }));

// Public: list all available character classes & their stats
router.get("/classes", getCharacterClasses);

// Select or change character for current user
router.post("/select", protect, selectCharacter);

// Get current user's character
router.get("/me", protect, getMyCharacter);

export default router;
