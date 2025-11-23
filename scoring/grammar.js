// functions/scoring/grammar.js
const fetch = require("node-fetch");

async function checkGrammar(text) {
  try {
    const params = new URLSearchParams();
    params.append("language", "en-US");
    params.append("text", text);

    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const data = await res.json();
    return data.matches.length;
  } catch (err) {
    return null;
  }
}

module.exports = {
  async evaluate(text, wordCount) {
    const errors = await checkGrammar(text);

    let errorsCount = errors;
    if (errors === null) {
      errorsCount = Math.round((wordCount / 100) * 5); // fallback
    }

    const errorsPer100 = wordCount > 0 ? errorsCount / (wordCount / 100) : 0;

    let raw = 1 - Math.min(errorsPer100 / 10, 1);
    if (raw < 0) raw = 0;

    let score = 0;
    let feedback = "";

    if (raw > 0.9) score = 10;
    else if (raw >= 0.7) score = 8;
    else if (raw >= 0.5) score = 6;
    else if (raw >= 0.3) score = 4;
    else {
      score = 2;
      feedback = "High grammar error rate.";
    }

    return {
      metric: "Grammar",
      score,
      max: 10,
      feedback
    };
  }
};
