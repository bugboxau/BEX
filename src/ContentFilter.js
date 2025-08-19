// src/ContentFilter.js

// Core banned patterns (individual words/slurs, obfuscations, academic misuse, etc.)
const baseBannedPatterns = [
  /cheat/i,
  /plagiar[i1!|]s[ei3]/i,
  /off[\s\-]*topic/i,
  /n[\W_]*s[\W_]*f[\W_]*w/i,
  /inappropriate/i,
  /how\s+(do|can)\s+i\s+(hack|bypass|cheat)/i,
  /(prompt|jailbreak)\s+me/i,
  /do\s+this\s+assignment\s+for\s+me/i,
  /write\s+(my|the)\s+homework/i,
  /tell\s+me\s+the\s+answer/i,

  // Profanity filters (simple versions, partial matches)
  /f+[\W_]*u+[\W_]*c+[\W_]*k+/i,
  /s+[\W_]*h+[\W_]*i+[\W_]*t+/i,
  /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h+/i,
  /n+[\W_]*i+[\W_]*g+[\W_]*g+[\W_]*e+[\W_]*r+/i,
  /k+[\W_]*i+[\W_]*k+[\W_]*e+/i,
  /c+[\W_]*h+[\W_]*i+[\W_]*n+[\W_]*k+/i,
  /\bspic\b/i,
  /\bgook\b/i,
  /t+[\W_]*a+[\W_]*r+[\W_]*b+/i,
  /s+[\W_]*l+[\W_]*u+[\W_]*t+/i,
  /c+[\W_]*u+[\W_]*n+[\W_]*t+/i,
  /f+[\W_]*a+[\W_]*g+[\W_]*g+[\W_]*o+[\W_]*t+/i,
  /\babo\b/i,
  /c+[\W_]*o+[\W_]*o+[\W_]*n+/i,
];

//Generate concatenated patterns automatically
function buildConcatenationPatterns(patterns) {
  const combos = [];
  for (let i = 0; i < patterns.length; i++) {
    for (let j = 0; j < patterns.length; j++) {
      if (i !== j) {
        const combo = new RegExp(
          patterns[i].source + patterns[j].source,
          "i"
        );
        combos.push(combo);
      }
    }
  }
  return combos;
}


// Merge both lists
const bannedPatterns = [
  ...baseBannedPatterns,
  ...buildConcatenationPatterns(baseBannedPatterns),
];

//Warning system
let warningCount = 0;
const MAX_WARNINGS = 3;

export function filterMessage(message) {
  for (const pattern of bannedPatterns) {
    if (pattern.test(message)) {
      warningCount++;

      if (warningCount >= MAX_WARNINGS) {
        return {
          allowed: false,
          reason: `You have triggered the content filter too many times. Let's take a short break and refocus on learning.`
        };
      }

      return {
        allowed: false,
        reason: `Your message may include unsafe or off-topic content. Please stay focused on your robotics learning.`
      };
    }
  }

  return { allowed: true };
}
