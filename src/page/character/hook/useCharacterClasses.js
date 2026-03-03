import { useEffect, useState } from "react";
import { fetchCharacterClasses } from "../open-api/characterApi.js";

// Frontend image assets mapped by class name
// Stats, buff, and descriptions all come from the server
const CLASS_IMAGE_MAP = {
  Mage:     require("../../../asserts/Mage.gif"),
  Tanker:   require("../../../asserts/Tanker.gif"),
  Fighter:  require("../../../asserts/Fighter.gif"),
  Assassin: require("../../../asserts/Assasin.gif"),
  Archer:   require("../../../asserts/Archer.gif"),
};

/**
 * Fetches character classes from MongoDB-backed API and merges local images.
 * Returns: { classes, loading, error }
 * Each class: { name, img, stats: { HP, SPEED, DAMAGE, ARMOR }, buff }
 */
export const useCharacterClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const raw = await fetchCharacterClasses();
        if (!alive) return;
        // Map server stats (lowercase keys) → UI stats (uppercase keys used by ProgressBar)
        const merged = raw.map((cls) => ({
          name: cls.name,
          img: CLASS_IMAGE_MAP[cls.name] || "/image/avatar/avatar-0.jpg",
          stats: {
            HP:     cls.stats?.hp     ?? 0,
            SPEED:  cls.stats?.speed  ?? 0,
            DAMAGE: cls.stats?.damage ?? 0,
            ARMOR:  cls.stats?.armor  ?? 0,
          },
          buff: cls.buff || "",
        }));
        setClasses(merged);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e.message || "Không tải được danh sách nhân vật");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  return { classes, loading, error };
};
