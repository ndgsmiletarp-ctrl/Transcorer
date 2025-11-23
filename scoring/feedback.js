// functions/scoring/feedback.js
module.exports = {
  generate(metrics, wpm) {
    let list = [];

    metrics.forEach(m => {
      if (m.feedback) list.push(m.feedback);
    });

    if (wpm < 80 || wpm > 160) {
      list.push("Adjust speaking speed.");
    }

    const final = list.length > 0
      ? list.join(" ")
      : "Good job! Keep improving your introduction skills.";

    return final;
  }
};
