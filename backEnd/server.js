const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./seed");
const runMigrations = require("./migrations");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
    if (process.env.JWT_SECRET.length < 32) {
      console.warn("Warning: JWT_SECRET is shorter than 32 characters; use a longer random secret.");
    }
    await connectDB();
    await runMigrations();
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error.message || error);
    process.exit(1);
  }
};

start();
