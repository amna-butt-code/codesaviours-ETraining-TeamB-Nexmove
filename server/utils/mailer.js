const nodemailer = require("nodemailer");

let transporter;

// Created once on first use, then reused
const getTransporter = () => {
  if (!transporter) {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
    if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
      throw new Error("Mail settings are missing in server/.env");
    }
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT) || 2525,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });
  }
  return transporter;
};

// One plain address only. Blocks commas, spaces and angle brackets so an
// attacker-controlled field can't turn this into a spam relay.
const SINGLE_EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/;

exports.sendMail = async ({ to, subject, html, text }) => {
  if (typeof to !== "string" || !SINGLE_EMAIL.test(to) || to.length > 254) {
    throw new Error("Invalid recipient address");
  }

  const info = await getTransporter().sendMail({
    from: process.env.MAIL_FROM || '"Nexmove Physiotherapy Clinic" <no-reply@nexmove.test>',
    to,
    subject,
    html,
    text,
  });
  return info.messageId;
};