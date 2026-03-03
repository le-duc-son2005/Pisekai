import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "material" },
    description: { type: String, default: "" },
    rarity: { type: String, enum: ["common", "uncommon", "rare", "epic", "legendary"], default: "common" },
    priceGold: { type: Number, default: 0 },
    priceGem: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema, "Items");
