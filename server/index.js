
require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/auth");
const holidayRoutes = require("./routes/holiday");
const therapistRoutes = require("./routes/therapist");
const appointmentRoutes = require("./routes/appointments");
const faqRoutes = require("./routes/faqRoutes");
const conditionRoutes = require("./routes/conditionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/postRoutes");
const packageRoutes = require("./routes/packageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "Nexmove" });
});

// Backend foundation routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);

// Existing main-branch routes
app.use("/api/faqs", faqRoutes);
app.use("/api/conditions", conditionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/packages", packageRoutes);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();
