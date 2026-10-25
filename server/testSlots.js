const { generateSlots } = require("./utils/slots");

console.log(
  generateSlots({
    date: "2030-01-15",
    workStart: "09:00",
    workEnd: "17:00",
    sessionMinutes: 60,
    breaks: [{ start: "13:00", end: "14:00" }],
    bookedSlots: ["10:00"],
  })
);
console.log(
  "holiday:",
  generateSlots({
    date: "2030-01-15",
    workStart: "09:00",
    workEnd: "17:00",
    sessionMinutes: 60,
    holidays: ["2030-01-15"],
  })
);