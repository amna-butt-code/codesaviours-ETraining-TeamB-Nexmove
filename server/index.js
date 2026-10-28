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

const app = express();

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
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/conditions", require("./routes/conditionRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();