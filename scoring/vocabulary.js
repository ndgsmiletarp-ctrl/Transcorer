// functions/scoring/vocabulary.js
const { toWords } = require("./utils");

module.exports = {
  evaluate(text) {
    const words = toWords(text);
    const total = words.length;
    const distinct = new Set(words).size;

    const ttr = total > 0 ? distinct / total : 0;

    let score = 0;
    let feedback = "";

    if (ttr >= 0.9) score = 10;
    else if (ttr >= 0.7) score = 8;
    else if (ttr >= 0.5) score = 6;
    else if (ttr >= 0.3) score = 4;
    else {
      score = 2;
      feedback = "Use more varied vocabulary.";
    }

    return {
      metric: "Vocabulary Richness (TTR)",
      score,
      max: 10,
      feedback
    };
  }
};
