import { minutesFromNow } from '../utils/formatters.js';
import { CHANNELS } from './channels.js';
import { STAFF_BY_ID } from './staff.js';
import { callNameOf } from '../utils/chat.js';

export const SEED_MESSAGES = CHANNELS.map((ch, index) => {
  const creatorId = ch.createdById || ch.createdBy || 'ruth';
  const creator = STAFF_BY_ID[creatorId];
  const creatorCallName = callNameOf(creator) || creatorId;
  return {
    id: `msg-seed-${ch.id}`,
    channelId: ch.id,
    senderId: creatorId,
    type: 'system',
    text: `${creatorCallName} created this channel`,
    createdAt: minutesFromNow(-((CHANNELS.length - index) * 60 + 120)),
    status: 'sent',
  };
});



