
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

const sendPasswordResetEmail = async (email, resetUrl) => {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS || !MAIL_FROM) {
    throw new Error("Email service is not configured.");
  }

  const transporter = nodemailer.createTransport({
   host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: Number(MAIL_PORT) === 465,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
    }
  });

  return transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Reset your password",
    text: [
      "We received a request to reset your password.",
      "",
      `Use this link to reset your password: ${resetUrl}`,
      "",
      "This link will expire after 15 minutes.",
      "If you did not request a password reset, you can ignore this email."
    ].join("\n")
  });
};

module.exports = { sendGuestBookingConfirmation, sendPasswordResetEmail};
