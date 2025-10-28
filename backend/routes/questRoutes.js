import express from "express";
import { listQuests, listCompletedQuests, seedQuests, statsQuests } from "../controllers/questController.js";
import { protect, maybeAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", maybeAuth, listQuests);
router.get("/completed", protect, listCompletedQuests);
router.post("/seed", seedQuests);
router.get("/seed", seedQuests); // dev convenience
router.get("/stats", statsQuests);

export default router;
