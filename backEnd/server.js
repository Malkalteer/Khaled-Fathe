const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require('cors');
const User = require("./models/User");
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", require("./routes/auth"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/upload", require("./routes/upload"));

// تقديم ملفات مجلد uploads للتمكن من رؤية الصورة كـ رابط
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
	const readyState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
	res.json({ server: 'ok', dbState: readyState });
});

app.get("/all", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const PORT = process.env.PORT || 5000;

const start = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (error) {
		console.error('Failed to start server:', error.message || error);
		process.exit(1);
	}
};

start();




//key db: al-aqvfhC5QEPK7b5UaGahCeAs8b92nHReixG4WPBPhNUb
//pass: gG14ykVYlwfw7NtP