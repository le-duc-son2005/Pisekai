import Listing from "../models/MarketListing.js";
import Inventory from "../models/Inventory.js";

export const getAllListings = async (req, res) => {
  try {
  const listings = await Listing.find({ status: "active" }).populate("weaponId sellerId");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

export const createListing = async (req, res) => {
  const { weaponId, price } = req.body;
  try {
    const item = await Inventory.findOne({ userId: req.user.id, weaponId });
    if (!item) return res.status(400).json({ message: "Bạn không sở hữu vũ khí này!" });

  const listing = new Listing({ sellerId: req.user.id, weaponId, price });
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng bán!" });
  }
};

export const buyItem = async (req, res) => {
  const { id } = req.params;
  try {
  const listing = await Listing.findById(id);
    if (!listing || listing.status !== "active") {
      return res.status(404).json({ message: "Món hàng không tồn tại!" });
    }

    listing.status = "sold";
    listing.buyerId = req.user.id;
    await listing.save();

    await Inventory.create({ userId: req.user.id, weaponId: listing.weaponId });
    res.json({ message: "Mua thành công!", listing });
  } catch (err) {
    res.status(500).json({ message: "Lỗi mua hàng!" });
  }
};
