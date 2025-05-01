// contentFilter.js

const bannedWords = ["inappropriate", "cheat", "plagiarise", "off-topic", "nsfw"]; // extend as needed

export function filterMessage(message) {
  for (const word of bannedWords) {
    if (message.toLowerCase().includes(word)) {
      return {
        allowed: false,
        reason: `Your message contains a restricted term: "${word}"`
      };
    }
  }

  return { allowed: true };
}
