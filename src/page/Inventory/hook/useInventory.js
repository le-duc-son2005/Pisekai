import { useEffect, useState } from "react";
import { fetchMyInventory } from "../open-api/inventoryApi.js";

/**
 * Fetches the logged-in user's inventory from the backend.
 * Returns: { items, loading, error, reload }
 * Each item: { _id, quantity, acquiredAt, weapon: { name, type, origin, rarity, description, stats, image } }
 */
export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyInventory();
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Cant load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, reload: load };
};
