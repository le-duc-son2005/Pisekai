import User from "../models/User.js";

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { avatar } = req.body; // expected to be a string path like '/image/avatar/avatar-0.jpg'
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    if (typeof avatar !== "string") return res.status(400).json({ message: "Thiếu hoặc sai avatar" });

    const updated = await User.findByIdAndUpdate(
      userId,
      { avatar: avatar || null },
      { new: true }
    ).lean().select("username email role gold gems characterId avatar");
    if (!updated) return res.status(404).json({ message: "Không tìm thấy user" });
    return res.json({ message: "Cập nhật avatar thành công", user: updated });
  } catch (e) {
    return res.status(500).json({ message: "Lỗi server", error: e.message });
  }
};
