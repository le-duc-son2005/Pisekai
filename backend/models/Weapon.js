import mongoose from "mongoose";

const weaponSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  origin: { type: String },
  rarity: { type: String, enum: ["common", "rare", "epic", "legendary"], default: "common" },
  description: { type: String },
  stats: {
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    magic: { type: Number, default: 0 },
  },
  price: { type: Number, default: 0 },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Weapon", weaponSchema);
