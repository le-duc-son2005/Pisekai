import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  packId: { type: mongoose.Schema.Types.ObjectId, ref: "RechargePack", required: true },
  orderCode: { type: Number, unique: true },
  amount: Number,
  status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema,"Orders");
