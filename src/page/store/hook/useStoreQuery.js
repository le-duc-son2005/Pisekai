import { useEffect, useState, useMemo } from "react";
import { fetchStoreItems } from "../open-api/storeApi";

export const useStoreQuery = (initial = { q: "", rarity: "All", sort: "price-asc", page: 1, limit: 8 }) => {
  const [q, setQ] = useState(initial.q);
  const [rarity, setRarity] = useState(initial.rarity);
  const [sort, setSort] = useState(initial.sort);
  const [page, setPage] = useState(initial.page);
  const [limit] = useState(initial.limit);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { items, total, page: p } = await fetchStoreItems({ q, rarity, sort, page, limit });
        setItems(items);
        setTotal(total);
        setPage(p);
      } catch (e) {
        setItems([]);
        setTotal(0);
        setError(e?.response?.data?.message || e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, rarity, sort, page, limit]);

  const data = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return {
    q,
    setQ,
    rarity,
    setRarity,
    sort,
    setSort,
    page,
    setPage,
    limit,
    data,
    total,
    loading,
    error,
  };
};
