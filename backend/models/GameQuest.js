import mongoose from "mongoose";

const GameQuestSchema = new mongoose.Schema(
  {
    questId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["daily", "main", "enchange", "event", "special", "newbie"],
    },
    description: { type: String, default: "" },
    requirement: { type: mongoose.Schema.Types.Mixed },
    reward: { type: mongoose.Schema.Types.Mixed },
    isRepeatable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Use the actual MongoDB collection name
const GameQuest = mongoose.model("GameQuest", GameQuestSchema, "Game_Quests");
export default GameQuest;
