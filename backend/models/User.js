import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // Game-related attributes
  role: { type: String, enum: ["player", "user", "admin"], default: "player" },
  characterId: { type: Types.ObjectId, ref: "Character", default: null },
  equippedWeapons: [{ type: Types.ObjectId, ref: "Weapon" }],
  gold: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  inventoriesId: { type: Types.ObjectId, ref: "Inventory", default: null },
  avatar: { type: String, default: null },

  // Timestamps
  joinedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema, "Users");
