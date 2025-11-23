const content = require("../scoring/content");
const speechRate = require("../scoring/speechRate");
const grammar = require("../scoring/grammar");
const vocabulary = require("../scoring/vocabulary");
const fillers = require("../scoring/fillers");
const sentiment = require("../scoring/sentiment");
const feedbackGen = require("../scoring/feedback");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, duration } = req.body;

    if (!text || !duration) {
      return res.status(400).json({ error: "Missing text or duration" });
    }

    const cleanText = text.trim();
    const wordCount = cleanText.split(/\s+/).length;
    const wpm = Math.round(wordCount / (duration / 60));

    const metrics = [];
    metrics.push(content.evaluate(cleanText));
    metrics.push(speechRate.evaluate(wpm));
    metrics.push(await grammar.evaluate(cleanText, wordCount));
    metrics.push(vocabulary.evaluate(cleanText));
    metrics.push(fillers.evaluate(cleanText, wordCount));
    metrics.push(sentiment.evaluate(cleanText));

    const total = metrics.reduce((s, m) => s + m.score, 0);
    const feedback = feedbackGen.generate(metrics, wpm);

    return res.status(200).json({
      overall_score: total,
      word_count: wordCount,
      wpm,
      metrics,
      feedback
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
};
