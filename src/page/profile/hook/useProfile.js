import { useState, useEffect, useCallback, useContext } from "react";
import { fetchMyProfile, updateAvatarApi } from "../open-api/userApi";
import { AuthContext } from "../../../context/AuthContext";

/**
 * Hook to load and update the logged-in user's profile.
 * @returns {{ profile, loading, error, changeAvatar, reload }}
 */
const useProfile = () => {
  const { login } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeAvatar = useCallback(async (avatarPath) => {
    try {
      const result = await updateAvatarApi(avatarPath);
      setProfile((prev) => ({ ...prev, avatar: avatarPath }));
      // Keep AuthContext in sync so panel/header shows new avatar immediately
      if (result.user) {
        login(result.user, null);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Cập nhật thất bại",
      };
    }
  }, [login]);

  return { profile, loading, error, changeAvatar, reload: load };
};

export default useProfile;
