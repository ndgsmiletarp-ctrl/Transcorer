// functions/scoring/fillers.js
const { toWords } = require("./utils");

const FILLERS = [
  "um", "uh", "like", "you know", "so", "actually", "basically",
  "right", "i mean", "well", "kinda", "sort of", "okay",
  "ok", "hmm", "ah"
];

module.exports = {
  evaluate(text, wordCount) {
    const t = text.toLowerCase();

    let count = 0;
    FILLERS.forEach(f => {
      const rx = new RegExp("\\b" + f.replace(" ", "\\s+") + "\\b", "g");
      const matches = t.match(rx);
      if (matches) count += matches.length;
    });

    const rate = wordCount === 0 ? 0 : (count / wordCount) * 100;

    let score = 0;
    let feedback = "";

    if (rate <= 3) score = 15;
    else if (rate <= 6) score = 12;
    else if (rate <= 9) score = 9;
    else if (rate <= 12) score = 6;
    else {
      score = 3;
      feedback = "Reduce filler words for clarity.";
    }

    return {
      metric: "Clarity / Filler Words",
      score,
      max: 15,
      feedback
    };
  }
};
