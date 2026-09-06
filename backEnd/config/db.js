const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    const dnsServers = (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map(server => server.trim())
      .filter(Boolean);

    dns.setServers(dnsServers);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
