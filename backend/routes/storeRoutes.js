import express from "express";
import { getStoreItems, createItem, purchaseItem } from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/items", getStoreItems);
router.post("/buy", protect, purchaseItem);
// Dev-only: open POST for quick seeding; secure with auth in production
router.post("/items", createItem);

export default router;
