
const nodemailer = require("nodemailer");

const sendGuestBookingConfirmation = async (appointment) => {
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS,MAIL_FROM} = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error("Email service is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter.sendMail({
    from: MAIL_FROM,
    to: appointment.guestEmail,
    subject: "Your appointment booking confirmation",
    text: [
      `Hello ${appointment.guestName},`,
      "",
      "Your appointment booking has been received.",
      `Appointment date: ${appointment.appointmentDate.toISOString()}`,
      `Booking status: ${appointment.status}`,
      "",
      "Please contact the clinic if you have any questions."
    ].join("\n")
  });
};

module.exports = { sendGuestBookingConfirmation };
