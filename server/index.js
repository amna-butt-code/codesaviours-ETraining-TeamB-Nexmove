require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const connectDB = require("./db");


const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "Nexmove" });
});

app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/conditions", require("./routes/conditionRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connectDB();
