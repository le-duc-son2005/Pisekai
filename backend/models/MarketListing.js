import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weaponId: { type: mongoose.Schema.Types.ObjectId, ref: "Weapon", required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["active", "sold", "cancelled"], default: "active" },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Listing", listingSchema);
