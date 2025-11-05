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
import battleRoutes from "./routes/battleRoutes.js";
import { listLevels, previewBattle, fightBattle, previewBattleOpen, fightBattleOpen } from "./controllers/battleController.js";
import { protect, maybeAuth } from "./middleware/authMiddleware.js";
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

// Global debug logger for /api/battle traffic
app.use((req, _res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/battle')) {
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
app.use("/api/battle", battleRoutes);
console.log('[boot] Mounted /api/battle routes');

// TEMP: direct binding for levels endpoint to bypass any router mounting issues
app.get("/api/battle/levels", listLevels);
console.log('[boot] Bound GET /api/battle/levels (direct)');
// TEMP: direct bindings for preview and fight to bypass router issues
app.get("/api/battle/preview/:monsterId", maybeAuth, previewBattle);
console.log('[boot] Bound GET /api/battle/preview/:monsterId (direct)');
app.post("/api/battle/fight/:monsterId", maybeAuth, fightBattle);
console.log('[boot] Bound POST /api/battle/fight/:monsterId (direct)');
// Open (no auth) direct bindings for debugging without login
app.get("/api/battle/preview-open/:monsterId", previewBattleOpen);
console.log('[boot] Bound GET /api/battle/preview-open/:monsterId (direct)');
app.post("/api/battle/fight-open/:monsterId", fightBattleOpen);
console.log('[boot] Bound POST /api/battle/fight-open/:monsterId (direct)');
// Quick ping for connectivity tests
app.get("/api/battle/ping", (_req, res) => res.json({ ok: true, where: "/api/battle/ping" }));

// Route map introspection to verify what endpoints are registered
app.get('/api/_routes', (_req, res) => {
  try {
    const collect = (stack, base = '') => {
      const out = [];
      stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods || {}).filter(Boolean).map(m => m.toUpperCase());
          out.push({ path: base + layer.route.path, methods });
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
          // Nested router: best-effort collection without exact mount path resolution
          out.push(...collect(layer.handle.stack, base));
        }
      });
      return out;
    };
    const routes = collect(app._router?.stack || []);
    // Also append the known debug endpoints in case Express internals changed
    const known = [
      { path: '/api/battle/ping', methods: ['GET'] },
      { path: '/api/battle/levels', methods: ['GET'] },
      { path: '/api/battle/preview/:monsterId', methods: ['GET'] },
      { path: '/api/battle/fight/:monsterId', methods: ['POST'] },
      { path: '/api/battle/preview-open/:monsterId', methods: ['GET'] },
      { path: '/api/battle/fight-open/:monsterId', methods: ['POST'] },
    ];
    res.json({ routes: [...routes, ...known] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TEMP direct bindings for debugging 404s reaching quests router
app.all("/api/quests/progress", protect, getProgress);
app.all("/api/quests/:questId/complete", protect, completeQuest);
app.get("/api/quests/ping", (_req, res) => res.json({ ok: true }));
// Open test endpoint (no auth) to quickly verify routing on user's machine
app.get("/api/quests/progress-open", (_req, res) => res.json({ ok: true, note: "public test route" }));

app.get('/', (req, res) => {
  res.send('Backend is running...');
});
app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    message: 'API root',
    try: [
      '/api/battle/ping',
      '/api/battle/levels',
      '/api/battle/preview-open/<monsterId>',
      '/api/battle/fight-open/<monsterId>',
    ],
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Minimal 404 logger to help diagnose "Cannot POST/GET" issues
app.use((req, res) => {
  console.warn(`404 -> ${req.method} ${req.originalUrl}`);
  if (req.originalUrl === '/api/battle/levels') {
    console.warn('[404-HINT] /api/battle/levels không được tìm thấy. Hãy kiểm tra:');
    console.warn(" - Đã mount router chưa? app.use('/api/battle', battleRoutes)");
    console.warn(" - Đã bind trực tiếp chưa? app.get('/api/battle/levels', listLevels)");
    console.warn(' - Backend có đang chạy đúng project/port 5000 không?');
  }
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});
