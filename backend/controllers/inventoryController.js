import Inventory from "../models/Inventory.js";

export const getMyInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ userId: req.user.id }).populate("weaponId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

export const addItemToInventory = async (req, res) => {
  try {
    const { weaponId } = req.body;
    if (!weaponId) return res.status(400).json({ message: "Thiếu weaponId" });
    const newItem = new Inventory({ userId: req.user.id, weaponId });
    await newItem.save();
    res.json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Thêm thất bại!" });
  }
};
