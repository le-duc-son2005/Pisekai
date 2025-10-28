import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const characterSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
  class: { type: String, required: true },
  level: { type: Number, default: null },
  exp: { type: Number, default: null },
  stats: {
    hp: { type: Number, required: true },
    speed: { type: Number, required: true },
    damage: { type: Number, required: true },
    armor: { type: Number, required: true },
    buff: { type: String, default: null },
  },
  activeQuests: { type: [String], default: null },
  completedQuests: { type: [String], default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Character", characterSchema, "Characters");
