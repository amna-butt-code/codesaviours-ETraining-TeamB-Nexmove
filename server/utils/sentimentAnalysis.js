const POSITIVE_WORDS = new Set([
  "amazing", "awesome", "better", "caring", "comfortable", "excellent",
  "effective", "friendly", "good", "great", "happy", "helpful", "improved",
  "improvement", "kind", "love", "professional", "recommend", "relief",
  "satisfied", "supportive", "wonderful", "gentle", "clean", "positive",
]);

const NEGATIVE_WORDS = new Set([
  "angry", "awful", "bad", "disappointed", "dirty", "expensive", "hurt",
  "ignored", "ineffective", "late", "negative", "painful", "poor", "problem",
  "problems", "rude", "slow", "terrible", "uncomfortable", "unhelpful",
  "unprofessional", "unsatisfied", "waste", "worse", "worst", "waiting",
]);

const NEGATIONS = new Set([
  "not", "no", "never", "neither", "hardly", "barely", "without", "isn't",
  "wasn't", "weren't", "don't", "didn't", "doesn't", "can't", "couldn't",
]);

/**
 * Small, deterministic MVP sentiment classifier for review moderation.
 * It labels text positive, neutral, or negative; it is not a medical or safety classifier.
 */
function classifySentiment(value) {
  const words = String(value || "")
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    let weight = POSITIVE_WORDS.has(word) ? 1 : NEGATIVE_WORDS.has(word) ? -1 : 0;

    if (weight === 0) continue;

    const precedingWords = words.slice(Math.max(0, i - 3), i);
    if (precedingWords.some((item) => NEGATIONS.has(item))) {
      weight *= -1;
    }

    score += weight;
  }

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

module.exports = { classifySentiment };
