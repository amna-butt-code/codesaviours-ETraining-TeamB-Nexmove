require("dotenv").config({
  path: "../.env.example",
});
const connectDB = require("./db");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/auth");


const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "Nexmove" });
});


app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connectDB();




