// src/utils/offlineTutor.js

export const getOfflineResponse = (message) => {
  const tips = [
    "Try using a for-loop to iterate through your array!",
    "Remember: JavaScript variables can be declared with let, const, or var.",
    "A function returns a value using the `return` keyword.",
    "Use console.log() to debug your code step by step.",
  ];

  // Pick a random tip
  return tips[Math.floor(Math.random() * tips.length)];
};
