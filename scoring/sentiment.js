// scoring/sentiment.js
// Replaces vader-sentiment (deprecated) with "sentiment" library

const Sentiment = require("sentiment");
const analyzer = new Sentiment();

module.exports = {
  evaluate(text) {
    const result = analyzer.analyze(text);

    const totalWords = text.trim().split(/\s+/).length || 1;
    const positiveCount = result.positive.length;

    const posScore = positiveCount / totalWords; // 0 to 1 scale
    let score = 0;

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
