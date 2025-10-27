import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Pisekai";
    // Mongoose v6+ tự xử lý các tuỳ chọn driver; chỉ thêm timeout nếu cần
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (uri: ${mongoUri.includes('127.0.0.1') ? 'local Pisekai' : 'from MONGO_URI'})`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
  }
};

export default connectDB;
