import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import characterRoutes from "./routes/characterRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import questRoutes from "./routes/questRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import { getProgress, completeQuest } from "./controllers/questController.js";




dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Global debug logger for /api/quests traffic
app.use((req, _res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/quests')) {
    console.log(`[api-log] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quests", questRoutes);

// TEMP direct bindings for debugging 404s reaching quests router
app.all("/api/quests/progress", protect, getProgress);
app.all("/api/quests/:questId/complete", protect, completeQuest);
app.get("/api/quests/ping", (_req, res) => res.json({ ok: true }));
// Open test endpoint (no auth) to quickly verify routing on user's machine
app.get("/api/quests/progress-open", (_req, res) => res.json({ ok: true, note: "public test route" }));

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Minimal 404 logger to help diagnose "Cannot POST/GET" issues
app.use((req, res) => {
  console.warn(`404 -> ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});
