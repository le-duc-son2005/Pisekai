import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (process.env.MONGOOSE_DEBUG === 'true') {
      mongoose.set('debug', true);
      console.log('📝 Mongoose debug is ENABLED');
    }
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Pisekai";
    // Mongoose v6+ tự xử lý các tuỳ chọn driver; chỉ thêm timeout nếu cần
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name}) (uri: ${mongoUri.includes('127.0.0.1') ? 'local default' : 'from MONGO_URI'})`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
  }
};

export default connectDB;
