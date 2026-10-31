const path = require("path");

// Load server/.env before importing modules that may use environment variables.
const envResult = require("dotenv").config({
  path: path.join(__dirname, ".env.example"),
});

if (envResult.error) {
  console.error("Could not load server/.env:", envResult.error.message);
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const reviewRoutes = require("./routes/reviewRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/auth");
const holidayRoutes = require("./routes/holiday");
const therapistRoutes = require("./routes/therapist");
const appointmentRoutes = require("./routes/appointments");
const chatRoutes = require("./routes/chat");
const faqRoutes = require("./routes/faqRoutes");
const conditionRoutes = require("./routes/conditionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/postRoutes");
const packageRoutes = require("./routes/packageRoutes");
const assistantRoutes = require("./routes/assistantRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    project: "Nexmove",
  });
});

// Backend foundation routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/assistant", assistantRoutes);

// Public content routes
app.use("/api/faqs", faqRoutes);
app.use("/api/conditions", conditionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/reviews", reviewRoutes);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Server startup aborted because the database connection failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();