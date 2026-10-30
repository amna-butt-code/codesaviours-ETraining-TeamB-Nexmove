const assert = require("node:assert/strict");
const { classifySentiment } = require("../utils/sentimentAnalysis");

const cases = [
  ["The therapist was excellent and helpful", "positive"],
  ["The staff were rude and the service was terrible", "negative"],
  ["The appointment was on Friday at 10", "neutral"],
  ["The therapist was not helpful", "negative"],
  ["The session was not bad", "positive"],
];

for (const [review, expected] of cases) {
  const actual = classifySentiment(review);
  assert.equal(actual, expected, `Unexpected sentiment for: ${review}`);
  console.log(`PASS ${actual}: ${review}`);
}
