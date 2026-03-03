import Item from "../models/Item.js";
import User from "../models/User.js";

export const purchaseItem = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    if (!itemId) return res.status(400).json({ message: "Thiếu itemId" });
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const useGold = item.priceGold > 0;
    const unitPrice = useGold ? item.priceGold : item.priceGem;
    const totalCost = unitPrice * qty;

    if (useGold) {
      if ((user.gold || 0) < totalCost)
        return res.status(400).json({ message: `Insufficient gold. need ${totalCost.toLocaleString()}, Had ${(user.gold || 0).toLocaleString()}` });
      user.gold -= totalCost;
    } else {
      if ((user.gems || 0) < totalCost)
        return res.status(400).json({ message: `Insufficient gems. need ${totalCost.toLocaleString()}, Had ${(user.gems || 0).toLocaleString()}` });
      user.gems -= totalCost;
    }

    await user.save();
    return res.json({
      message: "Purchase successful!",
      itemName: item.name,
      quantity: qty,
      totalCost,
      currency: useGold ? "Gold" : "Gem",
      gold: user.gold,
      gems: user.gems,
    });
  } catch (err) {
    console.error("purchaseItem error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStoreItems = async (req, res) => {
  try {
    const { q, rarity, type, sort, page = 1, limit = 8 } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") }, //i for no compare A or a
        { type: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    }
    if (rarity && rarity !== "All") filter.rarity = new RegExp(`^${rarity}$`, "i");
    if (type) filter.type = new RegExp(`^${type}$`, "i");

    // Pagination params
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 8);

    let queryExec = Item.find(filter);
    if (sort === "price-asc") queryExec = queryExec.sort({ priceGold: 1, priceGem: 1 });
    if (sort === "price-desc") queryExec = queryExec.sort({ priceGold: -1, priceGem: -1 });
    if (sort === "name-asc") queryExec = queryExec.sort({ name: 1 });
    if (sort === "name-desc") queryExec = queryExec.sort({ name: -1 });

    const total = await Item.countDocuments(filter);
    const items = await queryExec.skip((pageNum - 1) * pageSize).limit(pageSize).exec();

    res.json({ items, total, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error("getStoreItems error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createItem = async (req, res) => {
  try {
    const { name, type, description, rarity, priceGold, priceGem, image } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });
    const item = await Item.create({ name, type, description, rarity, priceGold, priceGem, image });
    res.status(201).json(item);
  } catch (err) {
    console.error("createItem error", err);
    res.status(500).json({ message: "Server error" });
  }
};
