// scoring/sentiment.js
// Pure rule-based positivity scorer (no dependencies)

const positiveWords = [
  "good", "great", "happy", "excited", "joy", "love",
  "enjoy", "proud", "fun", "wonderful", "excellent",
  "positive", "glad", "best", "amazing", "awesome",
  "thank", "thanks"
];

module.exports = {
  evaluate(text) {
    const words = text.toLowerCase().trim().split(/\s+/);
    const total = words.length || 1;

    let positiveCount = 0;
    for (let w of words) {
      if (positiveWords.includes(w)) {
        positiveCount++;
      }
    }

    const posScore = positiveCount / total; // 0 → 1 scale

    let score = 0;

    // Map to rubric (Engagement/Sentiment = 15 pts)
    if (posScore >= 0.9) score = 15;
    else if (posScore >= 0.7) score = 12;
    else if (posScore >= 0.5) score = 9;
    else if (posScore >= 0.3) score = 6;
    else score = 3;

    return {
      metric: "Sentiment / Engagement",
      score,
      max: 15,
      feedback: ""
    };
  }
};
