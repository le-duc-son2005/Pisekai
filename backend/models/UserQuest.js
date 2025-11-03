import mongoose from "mongoose";

const UserQuestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    questId: { type: Number, index: true, required: true },
    status: { type: String, enum: ["completed"], required: true },
    claimed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

UserQuestSchema.index({ userId: 1, questId: 1 }, { unique: true });

const UserQuest = mongoose.model("UserQuest", UserQuestSchema);
export default UserQuest;
