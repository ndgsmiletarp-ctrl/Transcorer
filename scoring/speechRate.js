// functions/scoring/speechRate.js
module.exports = {
  evaluate(wpm) {
    let score = 0;
    let feedback = "";

    if (wpm >= 111 && wpm <= 140) score = 10;
    else if ((wpm >= 81 && wpm <= 110) || (wpm >= 141 && wpm <= 160)) {
      score = 6;
      feedback = "Speech speed slightly off ideal range.";
    } else {
      score = 2;
      feedback = "Speech too fast or too slow.";
    }

    return {
      metric: "Speech Rate (WPM)",
      score,
      max: 10,
      feedback
    };
  }
};
