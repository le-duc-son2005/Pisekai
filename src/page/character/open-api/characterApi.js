import API from "../../../api/api.js";

/**
 * Fetch all playable character classes from the backend.
 * Returns: [{ name, stats: { hp, speed, damage, armor }, buff }]
 */
export const fetchCharacterClasses = async () => {
  const { data } = await API.get("/characters/classes");
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch the currently-logged-in user's character from MongoDB.
 * Returns the character document, or null if not found.
 */
export const fetchMyCharacter = async () => {
  try {
    const { data } = await API.get("/characters/me");
    return data;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
};

/**
 * Pick a character class for the current user.
 * Returns the newly-created character document.
 */
export const selectCharacterClass = async (className) => {
  const { data } = await API.post("/characters/select", { class: className });
  return data;
};
