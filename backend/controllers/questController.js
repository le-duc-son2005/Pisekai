import mongoose from "mongoose";
import GameQuest from "../models/GameQuest.js";
import UserQuest from "../models/UserQuest.js";
import User from "../models/User.js";
import Character from "../models/Character.js";

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
      let picked = allDaily
        .map((q) => ({ q, s: score(Number(q.questId) || 0) }))
        .sort((a, b) => a.s - b.s)
        .slice(0, 10)
        .map((x) => x.q);
      // Always include a login quest if available
      const loginQuest = allDaily.find((q) => typeof q.name === 'string' && /login|đăng\s*nhập/i.test(q.name));
      if (loginQuest && !picked.find((p) => p.questId === loginQuest.questId)) {
        // Replace last item to keep total at 10
        if (picked.length >= 10) picked[picked.length - 1] = loginQuest; else picked.push(loginQuest);
      }
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
    // merge claim info
    const map = new Map(completed.map((c) => [c.questId, c]));
    const merged = quests.map((q) => ({ ...q, _progress: { status: "completed", claimed: !!map.get(q.questId)?.claimed } }));
    return res.json(merged);
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

// GET /api/quests/progress (protected)
export const getProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    const docs = await UserQuest.find({ userId }).lean();
    return res.json(docs.map(({ userId: _u, _id, __v, ...rest }) => rest));
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// POST /api/quests/:questId/complete (protected)
export const completeQuest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    const questId = Number(req.params.questId);
    if (!questId) return res.status(400).json({ message: "Thiếu questId" });
    const quest = await GameQuest.findOne({ questId }).lean();
    if (!quest) return res.status(404).json({ message: "Không tìm thấy quest" });
    // Daily quests should be completable once per day -> reset claimed when new day
    if ((quest.type || '').toLowerCase() === 'daily') {
      const now = new Date();
      const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      let progress = await UserQuest.findOne({ userId, questId });
      if (!progress) {
        progress = await UserQuest.create({ userId, questId, status: 'completed', claimed: false, completedAt: now });
      } else if (!sameDay(progress.completedAt, now)) {
        progress.status = 'completed';
        progress.claimed = false; // reset claim for a new day
        progress.completedAt = now;
        await progress.save();
      }
      return res.json({ ok: true, progress: { questId, status: 'completed', claimed: !!progress.claimed } });
    }

    // Non-daily: normal complete (only once)
    const doc = await UserQuest.findOneAndUpdate(
      { userId, questId },
      { $setOnInsert: { status: "completed", claimed: false, completedAt: new Date() }, $set: { status: "completed" } },
      { new: true, upsert: true }
    );
    return res.json({ ok: true, progress: { questId, status: doc.status, claimed: !!doc.claimed } });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// POST /api/quests/:questId/claim (protected)
export const claimQuest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    const questId = Number(req.params.questId);
    if (!questId) return res.status(400).json({ message: "Thiếu questId" });
    let progress = await UserQuest.findOne({ userId, questId });
    if (!progress || progress.status !== "completed") return res.status(400).json({ message: "Chưa hoàn thành nhiệm vụ" });
    // Load quest and for daily ensure claim is for today (reset by complete endpoint)
    const quest = await GameQuest.findOne({ questId }).lean();
    if (!quest) return res.status(404).json({ message: "Không tìm thấy quest" });
    if ((quest?.type || '').toLowerCase() === 'daily') {
      const now = new Date();
      const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      if (!sameDay(progress.completedAt, now)) {
        return res.status(400).json({ message: "Nhiệm vụ daily đã cũ, vui lòng hoàn thành lại hôm nay" });
      }
    }
    if (progress.claimed) return res.status(400).json({ message: "Đã nhận phần thưởng" });
    // Apply rewards to user (gold/coins, gems, exp)
    const rawReward = quest?.reward;

    // Parse reward robustly: handle keys like exp/EXP/xp/experience, coins/gold, gems; handle numeric strings and lines like "EXP +50"
    const parseNumber = (v) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const m = v.match(/[-+]?\d+/);
        return m ? parseInt(m[0], 10) : 0;
      }
      return 0;
    };
    const lowerKeys = (obj) => {
      const out = {};
      Object.keys(obj || {}).forEach((k) => { out[k.toLowerCase()] = obj[k]; });
      return out;
    };
    let inc = { gold: 0, gems: 0, exp: 0 };
    if (rawReward && typeof rawReward === 'object' && !Array.isArray(rawReward)) {
      const r = lowerKeys(rawReward);
      inc.exp = parseNumber(r.exp ?? r.xp ?? r.experience ?? r['exp+'] ?? 0);
      inc.gold = parseNumber(r.gold ?? r.coins ?? r.coin ?? 0);
      inc.gems = parseNumber(r.gems ?? r.gem ?? 0);
      // Also check if object values contain strings like 'EXP +50'
      for (const val of Object.values(r)) {
        if (typeof val === 'string') {
          if (/exp/i.test(val)) inc.exp = Math.max(inc.exp, parseNumber(val));
          if (/coin|gold/i.test(val)) inc.gold = Math.max(inc.gold, parseNumber(val));
          if (/gem/i.test(val)) inc.gems = Math.max(inc.gems, parseNumber(val));
        }
      }
    } else if (typeof rawReward === 'string') {
      // Single string reward description like "EXP +50, Coin +50"
      const parts = rawReward.split(/[;,]/);
      for (const p of parts) {
        if (/exp/i.test(p)) inc.exp = Math.max(inc.exp, parseNumber(p));
        if (/coin|gold/i.test(p)) inc.gold = Math.max(inc.gold, parseNumber(p));
        if (/gem/i.test(p)) inc.gems = Math.max(inc.gems, parseNumber(p));
      }
    }
    // Ensure user exists and update wallet
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    user.gold = (user.gold || 0) + inc.gold;
    user.gems = (user.gems || 0) + inc.gems;
    await user.save();

    // Apply EXP to Character (preferred), fallback to user.exp if character missing
    try {
      let ch = await Character.findOne({ userId });
      if (ch) {
        const EXP_PER_LEVEL = 100; // 0/100 mỗi cấp
        ch.exp = (ch.exp || 0) + (inc.exp || 0);
        // Level-up loop
        while (ch.exp >= EXP_PER_LEVEL) {
          ch.exp -= EXP_PER_LEVEL;
          ch.level = (ch.level || 1) + 1;
          // Basic stat growth per level
          if (!ch.stats) ch.stats = {};
          ch.stats.hp = Math.round((ch.stats.hp || 0) + 10);
          ch.stats.speed = Math.round((ch.stats.speed || 0) + 1);
          ch.stats.damage = Math.round((ch.stats.damage || 0) + 5);
          ch.stats.armor = Math.round((ch.stats.armor || 0) + 2);
        }
        await ch.save();
      } else {
        // Fallback: keep legacy user.exp if no character yet
        if (typeof user.exp !== 'number') user.exp = 0;
        user.exp += inc.exp || 0;
        await user.save();
      }
    } catch (_) {
      // If Character model not available for some reason, keep legacy user.exp
      if (typeof user.exp !== 'number') user.exp = 0;
      user.exp += inc.exp || 0;
      await user.save();
    }

    progress.claimed = true;
    await progress.save();
    return res.json({ ok: true, progress: { questId, status: "completed", claimed: true }, rewardApplied: inc });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};
