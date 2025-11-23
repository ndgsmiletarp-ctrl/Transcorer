// functions/scoring/utils.js
function cleanText(text) {
  return String(text || "").trim();
}

function toWords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function countSentences(text) {
  if (!text) return 0;
  const parts = text.split(/[.!?]+/).map(p => p.trim()).filter(Boolean);
  return parts.length;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  cleanText,
  toWords,
  countSentences,
  escapeRegex
};
