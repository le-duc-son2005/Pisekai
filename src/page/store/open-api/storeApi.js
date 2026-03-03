import API from "../../../api/api";

export const fetchStoreItems = async ({ q = "", rarity = "All", sort = "price-asc", page = 1, limit = 8 }) => {
  const { data } = await API.get("/store/items", { params: { q, rarity, sort, page, limit } });
  return Array.isArray(data)
    ? { items: data, total: data.length, page, limit }
    : { items: data.items || [], total: Number(data.total) || 0, page: Number(data.page) || page, limit: Number(data.limit) || limit };
};

/**
 * Purchase an item from the store.
 * @param {{ itemId: string, quantity: number }} payload
 */
export const purchaseStoreItem = async ({ itemId, quantity = 1 }) => {
  const { data } = await API.post("/store/buy", { itemId, quantity });
  return data; 
};
