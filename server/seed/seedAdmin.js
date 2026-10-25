require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const { MONGO_URI, ADMIN_NAME = "Nexmove Admin", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = "admin";
      await existing.save();
      console.log("Existing user promoted to admin. Password left unchanged.");
    } else {
      await User.create({
        name: ADMIN_NAME,
        email,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "admin",
      });
      console.log("Admin user created.");
    }
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();