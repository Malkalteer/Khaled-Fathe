const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  // اختياري: بعض الشبكات تفشل في استعلامات SRV الخاصة بـ mongodb+srv.
  // في هذه الحالة فقط ضع MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8 في ملف .env
  if (process.env.MONGO_DNS_SERVERS) {
    dns.setServers(process.env.MONGO_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

module.exports = connectDB;
