import Character from "../models/Character.js";
import User from "../models/User.js";

// Define server-side catalog to prevent tampering from client
const CLASS_CATALOG = {
  Mage: {
    stats: { hp: 55, speed: 75, damage: 85, armor: 35 },
    buff: "+20% armor penetration",
  },
  Tanker: {
    stats: { hp: 90, speed: 30, damage: 50, armor: 80 },
    buff: "+10% damage reduction",
  },
  Fighter: {
    stats: { hp: 70, speed: 50, damage: 65, armor: 65 },
    buff: "+15% crit chance on first hit ",
  },
  Assassin: {
    stats: { hp: 55, speed: 90, damage: 80, armor: 25 },
    buff: "+15% lifesteal",
  },
  Archer: {
    stats: { hp: 75, speed: 70, damage: 60, armor: 45 },
    buff: "+25% crit damage",
  },
};

export const selectCharacter = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { class: className } = req.body;

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    if (!className) return res.status(400).json({ message: "Thiếu class" });

    const def = CLASS_CATALOG[className];
    if (!def) return res.status(400).json({ message: "Class không hợp lệ" });

    // Enforce single-role: if user already has a character, do not overwrite
    const user = await User.findById(userId).select("characterId");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    if (user.characterId) {
      return res.status(400).json({ message: "Bạn đã chọn nhân vật rồi" });
    }

    // Build document fields
    const payload = {
      userId,
      class: className,
      level: 1,
      exp: 0,
      stats: { ...def.stats, buff: def.buff },
      activeQuests: null,
      completedQuests: null,
    };

    // Create character
    const character = await Character.create(payload);

    // Ensure User.characterId is set
    await User.findByIdAndUpdate(userId, { characterId: character._id });

    return res.status(200).json({
      message: "Chọn nhân vật thành công",
      character,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getMyCharacter = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const character = await Character.findOne({ userId });
    if (!character) return res.status(404).json({ message: "Chưa có nhân vật" });

    return res.json(character);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
