require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { verifyRequestOrigin, getAllowedOrigins } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { sitemap } = require("./controllers/sitemapController");
const { publicDir } = require("./services/storage");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || getAllowedOrigins().includes(origin)) return callback(null, true);
    return callback(new Error("Origin غير مسموح"));
  },
  credentials: true
}));
app.use(verifyRequestOrigin);

if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

app.use("/api/auth", require("./routes/auth"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/product-interactions", require("./routes/productInteractions"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/quotes", require("./routes/quotes"));
app.use("/api/admin", require("./routes/admin"));
app.get("/sitemap.xml", sitemap);

// الصور المرفوعة (محفوظة على السيرفر). أسماؤها عشوائية ولا تتغير، لذلك تُخزَّن في المتصفح لمدة سنة.
app.use("/uploads", express.static(publicDir(), {
  index: false,
  dotfiles: "deny",
  immutable: true,
  maxAge: "365d",
  setHeaders: (response) => response.set("X-Content-Type-Options", "nosniff")
}));

app.get("/health", (req, res) => {
  res.json({ server: "ok", dbState: mongoose.connection.readyState });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
