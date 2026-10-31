const { sendMail } = require("../utils/mailer");

// Verified details from docs/clinic-info.md. Update there first if they change.
const CLINIC = {
  name: "Nexmove Physiotherapy Clinic",
  address: "Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad",
  phone: "03266312211",
};

// Anything a patient typed must be escaped before it goes into HTML
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Keeps header text (the subject) on one line
const oneLine = (value) => String(value ?? "").replace(/[\r\n]+/g, " ").trim();

const build = ({ patientName, serviceTitle, therapistName, date, slot, status = "Pending" }) => {
  const rows = [
    ["Service", serviceTitle],
    ["Physiotherapist", therapistName],
    ["Date", date],
    ["Time", slot],
    ["Status", status],
  ];

  const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;line-height:1.5">
  <h2 style="color:#0a2350;margin-bottom:4px">${escapeHtml(CLINIC.name)}</h2>
  <p>Hi ${escapeHtml(patientName)},</p>
  <p>Thank you for booking with us. We have received your appointment request. It stays <strong>${escapeHtml(status)}</strong> until the clinic confirms it.</p>
  <table style="border-collapse:collapse;width:100%">
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${label}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(value)}</strong></td></tr>`
      )
      .join("")}
  </table>
  <p>To change or cancel, please contact the clinic on ${escapeHtml(CLINIC.phone)}.</p>
  <p style="color:#6b7280;font-size:13px">If you feel unwell or have an emergency, please seek urgent medical care instead of waiting for your appointment.</p>
  <p style="color:#6b7280;font-size:13px">${escapeHtml(CLINIC.name)}, ${escapeHtml(CLINIC.address)}</p>
</div>`;

  const text = [
    `Hi ${patientName},`,
    "",
    `We have received your appointment request. It stays ${status} until the clinic confirms it.`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `To change or cancel, please contact the clinic on ${CLINIC.phone}.`,
    "If you feel unwell or have an emergency, please seek urgent medical care instead of waiting for your appointment.",
    "",
    `${CLINIC.name}, ${CLINIC.address}`,
  ].join("\n");

  return { subject: oneLine(`Your ${CLINIC.name} appointment request (${status})`), html, text };
};

exports.buildBookingConfirmation = build;
exports.sendBookingConfirmation = (to, data) => sendMail({ to, ...build(data) });