const assert = require("assert");
const { generateSlots } = require("./utils/slots");

const base = { date: "2030-01-15", workStart: "09:00", workEnd: "17:00", sessionMinutes: 60 };

// 1. Normal day, a break and a booked slot
assert.deepStrictEqual(
  generateSlots({ ...base, breaks: [{ start: "13:00", end: "14:00" }], bookedSlots: ["10:00"] }),
  ["09:00", "11:00", "12:00", "14:00", "15:00", "16:00"]
);

// 2. Holiday and leave day return nothing
assert.deepStrictEqual(generateSlots({ ...base, holidays: ["2030-01-15"] }), []);
assert.deepStrictEqual(generateSlots({ ...base, leaveDays: ["2030-01-15"] }), []);

// 3. Past date returns nothing
assert.deepStrictEqual(generateSlots({ ...base, date: "2000-01-01" }), []);

// 4. Break that overlaps part of a slot removes that slot
assert.deepStrictEqual(
  generateSlots({
    date: "2030-01-15", workStart: "09:00", workEnd: "12:00", sessionMinutes: 45,
    breaks: [{ start: "10:00", end: "10:30" }],
  }),
  ["09:00", "10:30", "11:15"]
);

// 5. Last slot must finish before closing time
assert.deepStrictEqual(
  generateSlots({ date: "2030-01-15", workStart: "09:00", workEnd: "10:30", sessionMinutes: 60 }),
  ["09:00"]
);

// 6. Bad session length returns nothing
assert.deepStrictEqual(generateSlots({ ...base, sessionMinutes: 0 }), []);

// 7. Today: slots before "now" are removed
assert.deepStrictEqual(
  generateSlots({ ...base, now: new Date("2030-01-15T11:30:00") }),
  ["12:00", "13:00", "14:00", "15:00", "16:00"]
);

console.log("All slot tests passed");