import mongoose from "mongoose";

const rechargePackSchema = new mongoose.Schema({
  price: { type: Number, required: true }, 
  gems: { type: Number, required: true },
  image: { type: String, default: "/images/recharge1.png" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RechargePack", rechargePackSchema, "Recharge_Packs");
