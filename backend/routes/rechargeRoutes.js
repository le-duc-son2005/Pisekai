import express from "express";
import { listPacks, createRechargeOrder, confirmOrder, cancelOrder } from "../controllers/rechargeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy danh sách gói nạp
router.get("/packs", listPacks);

// Tạo đơn thanh toán PayOS
router.post("/create", protect, createRechargeOrder);

// Tạm thời front-end sẽ gọi các endpoint này khi người dùng quay lại trang success/fail
router.post("/confirm", protect, confirmOrder);
router.post("/cancel", protect, cancelOrder);

/* // Nhận callback PayOS
router.post("/callback", handlePayOSCallback); */

export default router;
