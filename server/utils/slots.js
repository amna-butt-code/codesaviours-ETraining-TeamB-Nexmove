// Pure slot generation logic. No database code.
// Times are "HH:MM" strings. Dates are "YYYY-MM-DD" strings.

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function generateSlots({
  date,
  workStart,
  workEnd,
  sessionMinutes,
  breaks = [],
  holidays = [],
  leaveDays = [],
  bookedSlots = [],
  now = new Date(),
}) {
  if (holidays.includes(date) || leaveDays.includes(date)) return [];
  if (!sessionMinutes || sessionMinutes <= 0) return [];

  const start = toMinutes(workStart);
  const end = toMinutes(workEnd);
  const brk = breaks.map((b) => ({ s: toMinutes(b.start), e: toMinutes(b.end) }));
  const booked = new Set(bookedSlots);
  const free = [];

  for (let t = start; t + sessionMinutes <= end; t += sessionMinutes) {
    const slotEnd = t + sessionMinutes;
    const overlapsBreak = brk.some((b) => t < b.e && slotEnd > b.s);
    if (overlapsBreak) continue;

    const label = toTime(t);
    if (booked.has(label)) continue;

    const slotDate = new Date(`${date}T${label}:00`);
    if (slotDate <= now) continue;

    free.push(label);
  }
  return free;
}

module.exports = { generateSlots };