// functions/scoring/sentiment.js
const vader = require("vader-sentiment");

module.exports = {
  evaluate(text) {
    const scores = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    const pos = scores.pos || 0;

    let score = 0;
    let feedback = "";

    if (pos >= 0.9) score = 15;
    else if (pos >= 0.7) score = 12;
    else if (pos >= 0.5) score = 9;
    else if (pos >= 0.3) score = 6;
    else {
      score = 3;
      feedback = "Try sounding more positive or enthusiastic.";
    }

    return {
      metric: "Engagement / Sentiment",
      score,
      max: 15,
      feedback
    };
  }
};
