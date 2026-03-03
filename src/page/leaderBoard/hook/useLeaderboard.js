import { useState, useEffect, useCallback } from "react";
import { fetchTopPlayers } from "../open-api/leaderboardApi";

/**
 * Hook to load leaderboard data from the server.
 * @param {number} limit
 * @returns {{ players, loading, error, reload }}
 */
const useLeaderboard = (limit = 20) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopPlayers(limit);
      setPlayers(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { players, loading, error, reload: load };
};

export default useLeaderboard;
