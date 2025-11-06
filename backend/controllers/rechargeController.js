import RechargePack from "../models/RechargePack.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// 🧩 Lấy danh sách gói nạp
export const listPacks = async (req, res) => {
  try {
    const packs = await RechargePack.find({}).sort({ price: 1 }).lean();
    res.json(packs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 💳 Tạo link thanh toán
export const createRechargeOrder = async (req, res) => {
  try {
    const { packId } = req.body;
    const userId = req.user?.id;

    const pack = await RechargePack.findById(packId);
    if (!pack) return res.status(404).json({ message: "Không tìm thấy gói nạp" });

    // 🔥 Mã order duy nhất
    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

    // Lưu order vào DB với trạng thái pending
    const created = await Order.create({
      userId,
      packId,
      orderCode,
      amount: pack.price,
      status: "PENDING",
    });
    console.log('[createRechargeOrder] createdOrder=', created);

    // Gọi PayOS tạo link thanh toán
    // Include orderCode in return/cancel URLs so PayOS redirect contains order identifier
    const returnUrlWithCode = `${process.env.PAYOS_RETURN_URL}?orderCode=${orderCode}`;
    const cancelUrlWithCode = `${process.env.PAYOS_CANCEL_URL}?orderCode=${orderCode}`;

    const paymentResp = await payos.paymentRequests.create({
      orderCode,
      amount: pack.price,
      description: `Nạp ${pack.gems} gem`,
      returnUrl: returnUrlWithCode,
      cancelUrl: cancelUrlWithCode,
    });

    // The SDK returns a data object; try a few common fields for the checkout URL
    const checkoutUrl = paymentResp?.checkoutUrl || paymentResp?.paymentLink?.checkoutUrl || paymentResp?.payment_link?.checkout_url;
    if (!checkoutUrl) {
      console.error('Unexpected PayOS response:', paymentResp);
      return res.status(500).json({ message: 'Không nhận được link thanh toán từ PayOS', detail: paymentResp });
    }

    // Trả cả checkoutUrl và orderCode để frontend có thể theo dõi
    res.json({ checkoutUrl, orderCode });
  } catch (err) {
    console.error("Lỗi tạo link:", err);
    res.status(500).json({ message: "Lỗi tạo thanh toán", error: err.message });
  }
};

// ✅ Xác nhận đơn từ frontend (tạm thời dùng client để xác nhận)
export const confirmOrder = async (req, res) => {
  try {
    const { orderCode } = req.body;
    console.log('[confirmOrder] body=', req.body);
    console.log('[confirmOrder] user=', req.user);
    const userId = req.user.id;
    // Atomically flip order status from non-PAID to PAID to avoid double-credit races
    const updatedOrder = await Order.findOneAndUpdate(
      { orderCode, userId, status: { $ne: "PAID" } },
      { $set: { status: "PAID" } },
      { new: true }
    );

  console.log('[confirmOrder] updatedOrder=', updatedOrder);

  if (!updatedOrder) {
      // Could be not found or already PAID
      const existing = await Order.findOne({ orderCode, userId });
      if (!existing) return res.status(404).json({ message: "Không tìm thấy đơn" });
      return res.json({ message: "Đã xác nhận trước đó", added: false });
    }

  // Cộng gem cho người dùng (happens only when we successfully switched to PAID)
    const pack = await RechargePack.findById(updatedOrder.packId);
  console.log('[confirmOrder] pack=', pack);
    if (pack && pack.gems) {
      const updatedUser = await User.findByIdAndUpdate(updatedOrder.userId, { $inc: { gems: pack.gems } }, { new: true });
      console.log('[confirmOrder] updatedUser gems=', updatedUser?.gems);
    }

    res.json({ message: "Xác nhận thành công", added: true, gems: pack?.gems || 0 });
  } catch (err) {
    console.error("confirmOrder error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ✅ Đánh dấu hủy đơn (khi người hủy thanh toán hoặc thất bại)
export const cancelOrder = async (req, res) => {
  try {
    const { orderCode } = req.body;
    const userId = req.user.id;
    // Atomically mark order as FAILED if not already FAILED
    const updated = await Order.findOneAndUpdate(
      { orderCode, userId, status: { $ne: "FAILED" } },
      { $set: { status: "FAILED" } },
      { new: true }
    );

    if (!updated) {
      const existing = await Order.findOne({ orderCode, userId });
      if (!existing) return res.status(404).json({ message: "Không tìm thấy đơn" });
      return res.json({ message: "Đã hủy trước đó" });
    }

    res.json({ message: "Đã hủy đơn" });
  } catch (err) {
    console.error("cancelOrder error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

