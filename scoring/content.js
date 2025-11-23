// functions/scoring/content.js
const { escapeRegex } = require("./utils");

module.exports = {
  evaluate(text) {
    const t = text.toLowerCase();

    /* -------------------------
       1. SALUTATION (0–5)
       ------------------------- */
    let salutationScore = 0;
    let feedback = "";

    if (/i am excited|feeling great|excited to introduce/.test(t)) {
      salutationScore = 5;
    } else if (/good morning|good afternoon|good evening|hello everyone/.test(t)) {
      salutationScore = 4;
    } else if (/^hello|^hi|hello\b|hi\b/.test(t)) {
      salutationScore = 2;
    } else {
      salutationScore = 0;
      feedback += "No salutation found. ";
    }

    /* -------------------------
       2. MUST HAVE (4 pts each)
       ------------------------- */
    const MUST = [
      { key: "name", rx: /\bmy name is\b|\bmyself\b/ },
      { key: "age", rx: /\b\d+\s*years?\s*old\b/ },
      { key: "class", rx: /\bclass\b|\bgrade\b|\bstandard\b/ },
      { key: "school", rx: /\bschool\b/ },
      { key: "family", rx: /\bfamily\b/ },
      { key: "hobby", rx: /\bhobby\b|\bhobbies\b|\blike to\b|\benjoy\b/ }
    ];

    let mustScore = 0;
    MUST.forEach(item => {
      if (item.rx.test(t)) mustScore += 4;
      else feedback += `Missing ${item.key}. `;
    });

    const mustMax = MUST.length * 4;

    /* ----------------------------
       3. GOOD TO HAVE (2 pts each)
       ---------------------------- */
    const GOOD = [
      { key: "about family", rx: /\bkind\b|\bcaring\b|\bnature\b/ },
      { key: "origin", rx: /\bi am from\b|\boriginally\b/ },
      { key: "ambition", rx: /\bambition\b|\bgoal\b|\bdream\b/ },
      { key: "fun fact", rx: /\bfun fact\b|\bspecial thing\b|\bone thing\b/ },
      { key: "strength", rx: /\bstrong\b|\bachievement\b|\bwinner\b/ }
    ];

    let goodScore = 0;
    GOOD.forEach(item => {
      if (item.rx.test(t)) goodScore += 2;
    });

    const goodMax = GOOD.length * 2;

    /* -------------------------
       4. FLOW (0–5)
       ------------------------- */
    let flowScore = 0;

    const salIndex = t.search(/hello everyone|hello|hi|good morning|good afternoon|good evening/);
    const nameIndex = t.search(/my name is|myself/);
    const basicsIndex = t.search(/years old|class|school/);
    const addIndex = t.search(/fun fact|ambition|goal|dream|achievement|special thing/);
    const closingIndex = t.search(/thank you/);

    const ordered =
      salIndex >= 0 &&
      nameIndex > salIndex &&
      basicsIndex > nameIndex &&
      (addIndex === -1 || addIndex > basicsIndex) &&
      (closingIndex === -1 || closingIndex > basicsIndex);

    if (ordered) flowScore = 5;

    const flowMax = 5;

    /* -------------------------
       FINAL CONTENT SCORE (40)
       ------------------------- */
    const rawTotal = salutationScore + mustScore + goodScore + flowScore;
    const rawMax = 5 + mustMax + goodMax + 5;

    const finalScore = Math.round((rawTotal / rawMax) * 40);

    return {
      metric: "Content & Structure",
      score: finalScore,
      max: 40,
      feedback: feedback.trim()
    };
  }
};
