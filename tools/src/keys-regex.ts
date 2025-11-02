const verbs = [
  "MUST",
  "NEVER",
  "ONLY",
  "MAY",
  "ASSUME",
  "IGNORE",
  "CONSIDER",
  "DOUBT",
  "MODIFY",
  "READ",
  "BROWSE",
  "SEARCH",
];

const regexUnion = String.raw`\b(${verbs.join("|")})\b`;
const leftBoundary = String.raw`\[?${regexUnion}\]?`;
console.log(leftBoundary);
