import { describe, it, expect } from 'vitest';
import { DEALS } from '../mock/deals.js';
import { INITIAL_MESSAGES } from '../mock/messages.js';
import { INITIAL_DOCUMENTS } from '../mock/documents.js';
import { INITIAL_ALERTS } from '../mock/alerts.js';
import { formatCurrency } from '../utils/formatters.js';

describe('Message, Document, and Alert Leak Checks', () => {
  // Aggregate all message texts
  const allMessages = Object.entries(INITIAL_MESSAGES).flatMap(([dealId, msgs]) =>
    msgs.map((m) => ({ dealId, id: m.id, text: m.content || '' }))
  );

  // Aggregate all document texts
  const allDocuments = INITIAL_DOCUMENTS.map((doc) => ({
    dealId: doc.dealId,
    id: doc.id,
    text: `${doc.title} ${doc.summaryText || ''}`,
  }));

  // Aggregate all alert texts
  const allAlerts = INITIAL_ALERTS.map((alert) => ({
    dealId: alert.dealId,
    id: alert.id,
    text: `${alert.title} ${alert.description || ''}`,
  }));

  const allItems = [
    ...allMessages.map((m) => ({ kind: 'message', ...m })),
    ...allDocuments.map((d) => ({ kind: 'document', ...d })),
    ...allAlerts.map((a) => ({ kind: 'alert', ...a })),
  ];

  it("no message, document, or alert contains any deal's privateAgentNotes text", () => {
    DEALS.forEach((deal) => {
      if (!deal.privateAgentNotes) return;
      allItems.forEach((item) => {
        expect(item.text).not.toContain(deal.privateAgentNotes);
      });
    });
  });

  it("no message, document, or alert contains a deal's commission amount (plain digits, commas, or formatted)", () => {
    DEALS.forEach((deal) => {
      if (deal.commissionAmount === undefined) return;
      const digits = String(deal.commissionAmount);
      const withCommas = deal.commissionAmount.toLocaleString();
      const formatted = formatCurrency(deal.commissionAmount);

      allItems.forEach((item) => {
        expect(item.text).not.toContain(digits);
        expect(item.text).not.toContain(withCommas);
        expect(item.text).not.toContain(formatted);
      });
    });
  });

  it('no message, document, or alert contains the phrases "private note" or "agent note" (case-insensitive)', () => {
    const PHRASE_REGEX = /\b(private\s+note|agent\s+note)s?\b/i;
    allItems.forEach((item) => {
      expect(item.text).not.toMatch(PHRASE_REGEX);
    });
  });

  it('separately list (do not fail on) any message or document containing the word "commission"', () => {
    const COMMISSION_REGEX = /\bcommission\b/i;
    const matches = allItems
      .filter((item) => item.kind !== 'alert' && COMMISSION_REGEX.test(item.text))
      .map((item) => `[${item.kind}] ${item.id} (deal: ${item.dealId}): "${item.text}"`);

    // Reporting list
    if (matches.length > 0) {
      console.log('Occurrences of word "commission" in messages/documents:');
      matches.forEach((m) => console.log('  ', m));
    } else {
      console.log('Zero occurrences of the word "commission" in messages or documents.');
    }
    // Test passes unconditionally as per instruction: "Separately LIST (do not fail on)"
    expect(Array.isArray(matches)).toBe(true);
  });
});
