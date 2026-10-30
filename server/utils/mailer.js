
const nodemailer = require("nodemailer");

let transporter;

// Support both MAIL_* and the existing SMTP_* environment variable names.
const getTransporter = () => {
  if (!transporter) {
    const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT) || 2525;
    const user = process.env.MAIL_USER || process.env.SMTP_USER;
    const pass = process.env.MAIL_PASS || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error("Mail settings are missing in server/.env");
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
};

const SINGLE_EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/;

exports.sendMail = async ({ to, subject, html, text }) => {
  if (
    typeof to !== "string" ||
    !SINGLE_EMAIL.test(to) ||
    to.length > 254
  ) {
    throw new Error("Invalid recipient address");
  }

  const info = await getTransporter().sendMail({
    from:
      process.env.MAIL_FROM ||
      '"Nexmove Physiotherapy Clinic" <no-reply@nexmove.test>',
    to,
    subject,
    html,
    text,
  });

  return info.messageId;
};
