import API from "../../../api/api.js";

/**
 * Fetch top players from MongoDB.
 * @param {number} limit - Max entries to return (default 20)
 * Returns: [{ rank, userId, username, avatar, class, level, exp }]
 */
export const fetchTopPlayers = async (limit = 20) => {
  const { data } = await API.get("/leaderboard/top", { params: { limit } });
  return Array.isArray(data) ? data : [];
};
