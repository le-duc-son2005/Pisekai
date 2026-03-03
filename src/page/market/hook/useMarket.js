import { useState, useEffect, useCallback } from "react";
import { fetchMarketListings, purchaseListing } from "../open-api/marketApi";

/**
 * Hook for market listings.
 * @returns {{ listings, loading, error, buyItem, reload }}
 */
const useMarket = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketListings();
      setListings(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const buyItem = useCallback(async (id) => {
    try {
      await purchaseListing(id);
      // Remove bought listing from local state
      setListings((prev) => prev.filter((l) => l._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Buy failed",
      };
    }
  }, []);

  return { listings, loading, error, buyItem, reload: load };
};

export default useMarket;
