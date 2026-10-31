/**
 * Believable scripted colleague replies for the Nigerian real estate staff chat prototype.
 * Plain English, no emoji.
 */

export const SCRIPTED_REPLIES = [
  'Noted. I will follow up on this with the client right away.',
  'Understood. The documents are ready for dispatch.',
  'I have updated the field viewing log accordingly.',
  'Thanks for the heads up. I will coordinate with the team.',
  'Copy that. Let me know once the client gives confirmation.',
  'Will review the file at my desk shortly.',
  'Inspection scheduled and vehicle clearance is sorted.',
  'Received. I will brief the manager during our afternoon update.',
  'Confirmed. Working on the title search at the registry today.',
  'Good update. I will keep the buyer side informed.',
  'Noted, thank you. Let us aim to close this before the weekend.',
  'All clear from my end. Proceed as planned.',
];

export function getRandomColleagueReply() {
  const index = Math.floor(Math.random() * SCRIPTED_REPLIES.length);
  return SCRIPTED_REPLIES[index];
}
