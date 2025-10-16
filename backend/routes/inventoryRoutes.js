import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyInventory, addItemToInventory } from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/my", protect, getMyInventory);
router.post("/add", protect, addItemToInventory);

export default router;
