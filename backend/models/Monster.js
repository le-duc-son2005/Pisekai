import mongoose from "mongoose";

const MonsterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, required: true },
    rarity: { type: String, enum: ["common", "uncommon", "rare", "epic", "legendary", "mythic"], default: "common" },
    stats: { type: mongoose.Schema.Types.Mixed },
    description: { type: String, default: "" },
    rewards: { type: mongoose.Schema.Types.Mixed },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

// Bind to existing collection name if already created in DB
const Monster = mongoose.model("Monster", MonsterSchema, "Monsters");
export default Monster;
