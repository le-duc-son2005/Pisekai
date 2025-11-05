import express from "express";
import { listLevels, previewBattle, fightBattle, previewBattleOpen, fightBattleOpen } from "../controllers/battleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug: log all requests hitting this router
router.use((req, _res, next) => {
	console.log(`[battle-router] ${req.method} ${req.path}`);
	next();
});

router.get("/levels", listLevels);
router.get("/preview/:monsterId", protect, previewBattle);
router.post("/fight/:monsterId", protect, fightBattle);
// Open routes for quick debugging (no auth)
router.get("/preview-open/:monsterId", previewBattleOpen);
router.post("/fight-open/:monsterId", fightBattleOpen);

export default router;
