// Turns "?page=abc" or "?limit=99999" into safe numbers
const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const serverError = (res) =>
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });

module.exports = { toPositiveInt, serverError };