// scoring/grammar.js
// Grammar scoring using LanguageTool API
// Vercel-safe version (CommonJS + dynamic import for node-fetch)

// Vercel does not allow "require('node-fetch')" directly.
// Use this wrapper instead:
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/* ----------------------------------------
   Call LanguageTool grammar API
---------------------------------------- */
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

    // LanguageTool returns an array: data.matches
    return data.matches.length;

  } catch (err) {
    console.error("Grammar API error (fallback triggered):", err);
    return null; // fallback fallback
  }
}

/* ----------------------------------------
   Scoring Logic (Rubric-based)
---------------------------------------- */
module.exports = {
  async evaluate(text, wordCount) {
    const errorCountFromAPI = await checkGrammar(text);

    // If API failed, fallback heuristic:
    let errors = errorCountFromAPI;
    if (errors === null) {
      // fallback heuristic: assume 5 errors per 100 words
      errors = Math.round((wordCount / 100) * 5);
    }

    const errorsPer100 =
      wordCount > 0 ? errors / (wordCount / 100) : 0;

    // Convert grammar quality to score buckets
    let score = 0;
    let feedback = "";

    /*
      Rubric (Grammar = 10 points)
      <=2 errors/100   → 10
      3–5              → 8
      6–9              → 6
      10–14            → 4
      >=15             → 2
    */

    if (errorsPer100 <= 2) score = 10;
    else if (errorsPer100 <= 5) score = 8;
    else if (errorsPer100 <= 9) score = 6;
    else if (errorsPer100 <= 14) score = 4;
    else {
      score = 2;
      feedback = "High grammar error rate.";
    }

    return {
      metric: "Grammar",
      score: score,
      max: 10,
      feedback: feedback
    };
  }
};
