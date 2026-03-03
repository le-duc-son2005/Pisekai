import API from "../../../api/api.js";

/**
 * Fetch all active market listings.
 * Returns: [{ _id, sellerId: {_id,username,avatar}, weaponId: {weapon fields}, price, status }]
 */
export const fetchMarketListings = async () => {
  const { data } = await API.get("/market/listings");
  return Array.isArray(data) ? data : [];
};

/**
 * Buy a listing by id.
 * Returns: { message, listing }
 */
export const purchaseListing = async (id) => {
  const { data } = await API.post(`/market/buy/${id}`);
  return data;
};
