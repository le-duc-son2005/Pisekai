import mongoose from "mongoose";
import GameQuest from "../models/GameQuest.js";
import UserQuest from "../models/UserQuest.js";

// Some minimal sample quests for development seeding
const sampleQuests = [
  {
    questId: 45,
    name: "Newbie XV: True Adventurer",
    type: "newbie",
    description: "Reach level 5 and unlock Battle Pass.",
    requirement: { playerLevel: 5 },
    reward: { exp: 800, item: "Battle Pass Ticket" },
    isRepeatable: false,
  },
  {
    questId: 101,
    name: "Daily Hunt",
    type: "daily",
    description: "Defeat 20 monsters in the field.",
    requirement: { kills: 20 },
    reward: { exp: 200, gold: 100 },
    isRepeatable: true,
  },
  {
    questId: 201,
    name: "Prologue: First Steps",
    type: "main",
    description: "Talk to the village chief.",
    requirement: { talkTo: "Village Chief" },
    reward: { exp: 300 },
    isRepeatable: false,
  },
  {
    questId: 301,
    name: "Enchange Trial",
    type: "enchange",
    description: "Upgrade any weapon to +1.",
    requirement: { upgrade: 1 },
    reward: { exp: 250, item: "Polish Stone" },
    isRepeatable: false,
  },
  {
    questId: 401,
    name: "Festival Helper",
    type: "event",
    description: "Collect 5 festival ribbons.",
    requirement: { ribbons: 5 },
    reward: { exp: 320, gems: 10 },
    isRepeatable: false,
  },
  {
    questId: 501,
    name: "Hidden Path",
    type: "special",
    description: "Find the secret cave behind the waterfall.",
    requirement: { discover: "Secret Cave" },
    reward: { exp: 500, item: "Ancient Coin" },
    isRepeatable: false,
  },
];

// GET /api/quests?type=...
export const listQuests = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type && type !== "all") {
      // Normalize and map synonyms so different spellings still match DB
      const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const t = String(type).toLowerCase();
      const TYPE_SYNONYMS = {
        enhance: ["enhance", "enchange", "enchance", "enhange", "enchant", "enchantment", "upgrade"],
        enchange: ["enhance", "enchange", "enchance", "enhange", "enchant", "enchantment", "upgrade"],
        daily: ["daily"],
        main: ["main", "story"],
        event: ["event"],
        special: ["special"],
        newbie: ["newbie", "beginner"],
      };
      const synonyms = TYPE_SYNONYMS[t] || [t];
      filter.$or = synonyms.map((s) => ({ type: { $regex: `^${escape(s)}$`, $options: "i" } }));
    }
    // Special handling for daily: require login and return deterministic 10/day
    if ((type || '').toLowerCase() === 'daily') {
      if (!req.user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để xem nhiệm vụ Daily' });
      }
      const allDaily = await GameQuest.find({ type: { $regex: '^daily$', $options: 'i' } }).lean();
      // Deterministic shuffle by current date (YYYY-MM-DD) so same set for the day
      const today = new Date();
      const seedStr = today.toISOString().substring(0, 10); // YYYY-MM-DD
      const seed = [...seedStr].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const score = (qid) => (qid * 9301 + seed * 49297) % 233280;
      const picked = allDaily
        .map((q) => ({ q, s: score(Number(q.questId) || 0) }))
        .sort((a, b) => a.s - b.s)
        .slice(0, 10)
        .map((x) => x.q);
      console.log(`[quests] DAILY db=${mongoose.connection?.name} total=${allDaily.length} picked=${picked.length}`);
      return res.json(picked);
    }

    const quests = await GameQuest.find(filter).sort({ questId: 1 }).lean();
    console.log(`[quests] db=${mongoose.connection?.name} col=Game_Quests filter=${JSON.stringify(filter)} found=${quests.length}`);
    return res.json(quests);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// GET /api/quests/completed
export const listCompletedQuests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    const completed = await UserQuest.find({ userId, status: "completed" }).lean();
    const ids = completed.map((c) => c.questId);
    if (ids.length === 0) return res.json([]);
    const quests = await GameQuest.find({ questId: { $in: ids } }).lean();
    return res.json(quests);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// POST /api/quests/seed  (dev only)
export const seedQuests = async (req, res) => {
  try {
    // Basic guard: allow when not production, or require header key if production
    const isProd = process.env.NODE_ENV === "production";
    const seedKey = req.headers["x-seed-key"]; // optional
    if (isProd && seedKey !== process.env.SEED_KEY) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ops = sampleQuests.map((q) => ({
      updateOne: {
        filter: { questId: q.questId },
        update: { $set: q },
        upsert: true,
      },
    }));
    const result = await GameQuest.bulkWrite(ops, { ordered: false });
    const count = await GameQuest.countDocuments();
    return res.json({ message: "Seeded quests", result, total: count });
  } catch (e) {
    return res.status(500).json({ message: "Seed failed", error: e.message });
  }
};

// GET /api/quests/stats
export const statsQuests = async (_req, res) => {
  try {
    const total = await GameQuest.countDocuments();
    const dbName = mongoose.connection?.name;
    const first = await GameQuest.find({}, { questId: 1, name: 1, type: 1 }).sort({ questId: 1 }).limit(5).lean();
    return res.json({ total, dbName, collection: "Game_Quests", sample: first });
  } catch (e) {
    return res.status(500).json({ message: "Stats error", error: e.message });
  }
};
