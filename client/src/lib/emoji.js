// marked extension for emoji: shortcodes (:wink:, :cry:) and emoticons (8-), ;)).
// Uses the same data as markdown-it-emoji, so posts written against its syntax
// render the same here. Code spans and blocks are left alone because marked
// tokenizes them separately.
import EMOJIS from 'markdown-it-emoji/lib/data/full.mjs';
import SHORTCUTS from 'markdown-it-emoji/lib/data/shortcuts.mjs';

const EMOTICONS = Object.fromEntries(
  Object.entries(SHORTCUTS).flatMap(([name, faces]) => faces.map(face => [face, EMOJIS[name]]))
);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Longest first, so ":-)" wins over ":)" style prefixes
const emoticonPattern = Object.keys(EMOTICONS)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join('|');

// An emoticon must stand alone, so "http://" or "(see 8)" aren't converted
const EMOTICON_END = '(?=[\\s.,!?]|$)';
const EMOTICON_AT_START = new RegExp(`^(?:${emoticonPattern})${EMOTICON_END}`);
const EMOTICON_ANYWHERE = new RegExp(`(^|\\s)(?:${emoticonPattern})${EMOTICON_END}`);
const SHORTCODE_AT_START = /^:([a-z0-9_+-]+):/;
const SHORTCODE_ANYWHERE = /:[a-z0-9_+-]+:/;

// Text just before the match, from the tokens marked has produced so far
const previousChar = (tokens) => tokens[tokens.length - 1]?.raw.slice(-1) ?? '';

export const emojiExtension = {
  extensions: [{
    name: 'emoji',
    level: 'inline',
    start(src) {
      const emoticon = src.match(EMOTICON_ANYWHERE);
      const shortcode = src.search(SHORTCODE_ANYWHERE);
      const candidates = [
        emoticon ? emoticon.index + emoticon[1].length : -1,
        shortcode
      ].filter(i => i >= 0);
      return candidates.length ? Math.min(...candidates) : undefined;
    },
    tokenizer(src, tokens) {
      const before = previousChar(tokens);

      const shortcode = SHORTCODE_AT_START.exec(src);
      if (shortcode && EMOJIS[shortcode[1]] && !/[a-z0-9]/i.test(before)) {
        return { type: 'emoji', raw: shortcode[0], emoji: EMOJIS[shortcode[1]] };
      }

      const emoticon = EMOTICON_AT_START.exec(src);
      if (emoticon && (before === '' || /\s/.test(before))) {
        return { type: 'emoji', raw: emoticon[0], emoji: EMOTICONS[emoticon[0]] };
      }
      return undefined;
    },
    renderer: (token) => token.emoji
  }]
};
