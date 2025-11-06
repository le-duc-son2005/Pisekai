import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import rechargeRoutes from "./routes/rechargeRoutes.js";




dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recharge", rechargeRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
