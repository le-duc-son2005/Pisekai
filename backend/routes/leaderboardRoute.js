import express from "express";
import { getTopPlayers } from "../controllers/leaderboardController.js";

const router = express.Router();

// GET /api/leaderboard/top?limit=20
router.get("/top", getTopPlayers);

export default router;
