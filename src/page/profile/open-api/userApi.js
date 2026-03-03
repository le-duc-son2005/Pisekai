import API from "../../../api/api.js";

/**
 * Fetch the logged-in user's full profile from MongoDB.
 * Returns: { _id, username, email, role, gold, gems, avatar, characterId, joinedAt }
 */
export const fetchMyProfile = async () => {
  const { data } = await API.get("/users/me");
  return data;
};

/**
 * Update the logged-in user's avatar.
 * @param {string} avatarPath  e.g. "/image/avatar/avatar-3.jpg"
 * Returns: { message, user }
 */
export const updateAvatarApi = async (avatarPath) => {
  const { data } = await API.put("/users/avatar", { avatar: avatarPath });
  return data; // { message, user }
};
