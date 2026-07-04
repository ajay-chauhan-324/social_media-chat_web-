/** Extract unique lowercase hashtags (without the #) from post text. */
export const extractHashtags = (text = '') => {
  const matches = text.match(/#([\p{L}0-9_]+)/gu) || [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
};

/** Extract unique @usernames (without the @) from post text. */
export const extractMentions = (text = '') => {
  const matches = text.match(/@([a-z0-9_.]+)/gi) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};
