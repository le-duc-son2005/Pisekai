import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Character from "../models/Character.js";
import { Types } from "mongoose";

dotenv.config();

export const registerUser = async (req, res) => {
  console.log("Body nhận được:", req.body);
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    if (username.length < 3)
      return res.status(400).json({ message: "Username phải có ít nhất 3 ký tự" });

    if (password.length < 6)
      return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự trở lên" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Định dạng email không hợp lệ! (chỉ chấp nhận dạng ten@gmail.com)" });
    }

    // Check trùng email hoặc username rõ ràng để FE báo đẹp
    const [emailTaken, usernameTaken] = await Promise.all([
      User.findOne({ email }).lean(),
      User.findOne({ username }).lean(),
    ]);
    if (emailTaken) return res.status(400).json({ message: "Email đã tồn tại" });
    if (usernameTaken) return res.status(400).json({ message: "Username đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      // các thuộc tính mặc định đã nằm trong schema (gold, gems, role, ...)
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: user.exp,
        gold: user.gold,
        gems: user.gems,
        characterId: user.characterId,
      },
    });
  } catch (err) {
    // Xử lý lỗi trùng key từ MongoDB (E11000)
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "email/username";
      return res.status(400).json({ message: `${field} đã tồn tại` });
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    // update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Lấy thông tin nhân vật (level/exp) nếu có
    let char = null;
    try {
      char = await Character.findOne({ userId: user._id }).select("level exp").lean();
    } catch (_) {}

    // Trả thêm thông tin để FE hiển thị ngay sau khi đăng nhập
    res.json({
      message: "Đăng nhập thành công",
      token,
      role: user.role,
      username: user.username,
      email: user.email,
      level: char?.level ?? undefined,
      exp: char?.exp ?? user.exp,
      gold: user.gold,
      gems: user.gems,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Verify token and return current user info
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }
  const user = await User.findById(userId).select("username email role exp gold gems characterId avatar");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    let char = null;
    try {
      char = await Character.findOne({ userId: user._id }).select("level exp").lean();
    } catch (_) {}
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      level: char?.level ?? undefined,
      exp: char?.exp ?? user.exp,
      gold: user.gold,
      gems: user.gems,
      characterId: user.characterId,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
