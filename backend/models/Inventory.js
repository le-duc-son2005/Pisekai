import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weaponId: { type: mongoose.Schema.Types.ObjectId, ref: "Weapon", required: true },
  quantity: { type: Number, default: 1 },
  acquiredAt: { type: Date, default: Date.now },
});

export default mongoose.model("Inventory", inventorySchema);
