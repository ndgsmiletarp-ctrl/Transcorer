// scoring/sentiment.js
// Uses "sentiment-lite" (Vercel-compatible)

const sentiment = require("sentiment-lite");

module.exports = {
  evaluate(text) {
    const result = sentiment(text);

    // sentiment-lite returns an integer score
    // negative → negative
    // positive → positive
    // We map this to positivity ratio:

    const words = text.trim().split(/\s+/).length || 1;
    const positivity = Math.max(0, result.score) / words; // 0 → ~1 scale

    let score = 0;

    /*
      Rubric:
      >=0.9 → 15
      0.7–0.89 → 12
      0.5–0.69 → 9
      0.3–0.49 → 6
      <0.3 → 3
    */

    if (positivity >= 0.9) score = 15;
    else if (positivity >= 0.7) score = 12;
    else if (positivity >= 0.5) score = 9;
    else if (positivity >= 0.3) score = 6;
    else score = 3;

    return {
      metric: "Sentiment / Engagement",
      score,
      max: 15,
      feedback: ""
    };
  }
};
