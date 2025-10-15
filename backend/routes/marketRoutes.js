import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllListings, createListing, buyItem } from "../controllers/marketController.js";

const router = express.Router();

router.get("/listings", getAllListings);
router.post("/list", protect, createListing);
router.post("/buy/:id", protect, buyItem);

export default router;
