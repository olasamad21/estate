/**
 * Reaction and emoji definitions.
 * All emoji characters are defined using Unicode \u escapes only.
 */

// Fixed set of 6 quick reactions
export const PRIMARY_REACTIONS = [
  '\u{1F44D}', // thumbs up
  '\u2705',     // check mark
  '\u{1F64F}', // folded hands
  '\u{1F440}', // eyes
  '\u{1F389}', // party popper
  '\u2764\uFE0F', // red heart
];

// Additional 6 emoji for the composer picker (12 total)
export const EXTRA_REACTIONS = [
  '\u{1F525}', // fire
  '\u{1F44F}', // clapping hands
  '\u{1F642}', // slightly smiling face
  '\u{1F91D}', // handshake
  '\u{1F3E0}', // house
  '\u2B50',     // star
];

export const ALL_PICKER_EMOJIS = [
  ...PRIMARY_REACTIONS,
  ...EXTRA_REACTIONS,
];
