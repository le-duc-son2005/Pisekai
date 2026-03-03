import User from "../models/User.js";

/**
 * GET /api/leaderboard/top?limit=20
 * Returns top players sorted by character level desc, then by username asc.
 * Each entry: { rank, userId, username, avatar, class, level }
 */
export const getTopPlayers = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    // Only include users who have a character
    const users = await User.find({ characterId: { $ne: null } })
      .select("username avatar characterId")
      .populate("characterId", "class level exp")
      .lean();

    // Sort by level desc, then username asc for stable ordering
    users.sort((a, b) => {
      const lvA = a.characterId?.level ?? 0;
      const lvB = b.characterId?.level ?? 0;
      if (lvB !== lvA) return lvB - lvA;
      return (a.username || "").localeCompare(b.username || "");
    });

    const result = users.slice(0, limit).map((u, idx) => ({
      rank: idx + 1,
      userId: u._id,
      username: u.username,
      avatar: u.avatar || null,
      class: u.characterId?.class || "-",
      level: u.characterId?.level ?? 0,
      exp: u.characterId?.exp ?? 0,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
