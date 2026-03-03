import API from "../../../api/api.js";

/**
 * Fetch the current user's inventory from MongoDB.
 * Returns: [{ _id, quantity, acquiredAt, weapon: { _id, name, type, origin, rarity, description, stats, image } }]
 */
export const fetchMyInventory = async () => {
  const { data } = await API.get("/inventory/my");
  // Normalise: weaponId is the populated weapon doc
  return Array.isArray(data)
    ? data.map((item) => ({
        _id: item._id,
        quantity: item.quantity ?? 1,
        acquiredAt: item.acquiredAt,
        weapon: item.weaponId ?? {},
      }))
    : [];
};
