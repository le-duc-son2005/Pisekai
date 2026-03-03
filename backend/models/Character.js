import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const characterSchema = new Schema({
  class: { type: String, required: true },
  stats: {
    hp: { type: Number, required: true },
    speed: { type: Number, required: true },
    damage: { type: Number, required: true },
    armor: { type: Number, required: true },
  },
  buff: { type: String, required: true },
  bonusStats: { type: String, required: true},
  image: { type: String, required: true},
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Character", characterSchema, "Characters");
