import express from "express";
import { listQuests, listCompletedQuests, seedQuests, statsQuests, getProgress, completeQuest, claimQuest } from "../controllers/questController.js";
import { protect, maybeAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug: log all requests hitting this router
router.use((req, _res, next) => {
	console.log(`[quests-router] ${req.method} ${req.path}`);
	next();
});

router.get("/", maybeAuth, listQuests);
router.get("/completed", protect, listCompletedQuests);
router.get("/progress", protect, getProgress);
router.post("/:questId/complete", protect, completeQuest);
router.post("/:questId/claim", protect, claimQuest);
router.post("/seed", seedQuests);
router.get("/seed", seedQuests); // dev convenience
router.get("/stats", statsQuests);

export default router;
