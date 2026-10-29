const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again in a while." },
});

const URGENT = [
  "chest pain", "can't breathe", "cannot breathe", "difficulty breathing",
  "sudden weakness", "numbness", "unconscious", "fainted", "severe bleeding",
  "accident", "stroke", "heart attack", "seizure",
];

const EMERGENCY_REPLY =
  "Your message may describe an urgent problem. Please seek emergency care now (in Pakistan, call Rescue 1122) or go to the nearest hospital. Do not wait for an appointment.";

const SYSTEM = `You are the Nexmove assistant for Nexmove Physiotherapy Clinic in Faisalabad, Pakistan.
Rules:
- Never diagnose, never prescribe, never give medical advice. Say you cannot give medical advice and suggest booking an assessment.
- For severe symptoms (chest pain, trouble breathing, sudden weakness, numbness, accident) tell the user to seek emergency care.
- Answer only about the clinic using these verified facts:
  Address: Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad.
  Phone: 0326 6312211. Bookings also by Instagram DM @nexmove_.
  Timings: men 9 AM to 1 PM; women and children 1 PM to 10 PM.
  Services: back and neck pain, joint and knee pain, sciatica and nerve problems, stroke and neurological rehabilitation, children's physiotherapy, sports injuries and post-fracture rehabilitation, frozen shoulder and movement problems.
- If asked about fees, email, days open or anything not listed, say that information is not available yet and suggest calling the clinic.
- Do not invent doctor names, prices or reviews.
- When appropriate, invite the user to book an appointment on the Book Appointment page.
- Keep answers short and in the language the user writes in.`;

router.post("/", limiter, async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 500) {
    return res.status(400).json({ message: "Please enter a message of up to 500 characters." });
  }

  if (URGENT.some((k) => message.toLowerCase().includes(k))) {
    return res.json({ reply: EMERGENCY_REPLY, urgent: true });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ message: "The assistant is not configured yet." });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
        signal: controller.signal,
      }
    );
    if (!r.ok) {
      console.error("Chat provider error:", r.status);
      return res.status(502).json({ message: "The assistant is unavailable right now. Please try again." });
    }
    const json = await r.json();
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      return res.status(502).json({ message: "The assistant sent an empty reply. Please try again." });
    }
    return res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.name);
    return res.status(502).json({ message: "The assistant is unavailable right now. Please try again." });
  } finally {
    clearTimeout(timer);
  }
});

module.exports = router;