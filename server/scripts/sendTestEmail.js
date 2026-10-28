require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { sendBookingConfirmation } = require("../emails/bookingConfirmation");

(async () => {
  try {
    // Fake data only. The HTML in the name checks that escaping works.
    const id = await sendBookingConfirmation("patient@example.com", {
      patientName: "Test <b>Patient</b>",
      serviceTitle: "Sample service",
      therapistName: "Sample therapist",
      date: "Monday, 26 October 2026",
      slot: "4:00 PM",
    });
    console.log("Sent. Message id:", id);
  } catch (error) {
    console.error("Email failed:", error.message);
    process.exitCode = 1;
  }
})();