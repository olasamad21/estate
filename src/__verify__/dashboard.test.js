import { describe, it, expect } from 'vitest';
import { DEALS } from '../mock/deals.js';
import { INITIAL_MESSAGES } from '../mock/messages.js';
import { PARTICIPANTS } from '../mock/roles.js';
import { getVisibleDeals } from '../utils/access.js';
import { daysFromNow, hoursFromNow } from '../utils/formatters.js';
import {
  filterDeals,
  countByFilter,
  sortDealsByUrgency,
  getDealUrgency,
  getLastMessage,
  getDealCardModel,
} from '../utils/dashboard.js';

describe('Dashboard Logic Tests (dashboard.test.js)', () => {
  it('filterDeals filters per category with hardcoded deal IDs and does not mutate', () => {
    const original = [...DEALS];

    const offers = filterDeals(DEALS, 'offers');
    expect(offers.map((d) => d.id)).toEqual(['deal_meadowbrook_104', 'deal_aspen_512']);

    const escrow = filterDeals(DEALS, 'escrow');
    expect(escrow.map((d) => d.id)).toEqual(['deal_harbor_218', 'deal_crestwood_740']);

    const closed = filterDeals(DEALS, 'closed');
    expect(closed.map((d) => d.id)).toEqual(['deal_stclaire_890']);

    // Unknown filter returns all
    const unknown = filterDeals(DEALS, 'unknown_filter');
    expect(unknown.map((d) => d.id)).toEqual(DEALS.map((d) => d.id));
    expect(unknown).not.toBe(DEALS);

    // No mutation
    expect(DEALS).toEqual(original);
  });

  it('countByFilter computes correct counts per role', () => {
    const roles = ['agent', 'buyer', 'seller', 'lender'];
    const expected = {
      agent: { all: 5, offers: 2, escrow: 2, closed: 1 },
      buyer: { all: 3, offers: 1, escrow: 1, closed: 1 },
      seller: { all: 3, offers: 0, escrow: 2, closed: 1 },
      lender: { all: 2, offers: 1, escrow: 1, closed: 0 },
    };

    roles.forEach((role) => {
      const visible = getVisibleDeals(role, DEALS);
      const counts = countByFilter(visible);
      expect(counts).toEqual(expected[role]);
    });
  });

  it('sortDealsByUrgency for Agent orders [aspen_512, meadowbrook_104, harbor_218, crestwood_740, stclaire_890]', () => {
    const agentDeals = getVisibleDeals('agent', DEALS);
    const sorted = sortDealsByUrgency(agentDeals);
    expect(sorted.map((d) => d.id)).toEqual([
      'deal_aspen_512',
      'deal_meadowbrook_104',
      'deal_harbor_218',
      'deal_crestwood_740',
      'deal_stclaire_890',
    ]);
  });

  it('getDealUrgency calculates urgency states accurately', () => {
    // Active offer expiring in 0 days (urgent)
    expect(
      getDealUrgency({ stage: 'active_offer', offerExpiresAt: hoursFromNow(2) })
    ).toBe('urgent');

    // Active offer expiring in 1 day (urgent)
    expect(
      getDealUrgency({ stage: 'active_offer', offerExpiresAt: daysFromNow(1) })
    ).toBe('urgent');

    // Active offer expiring in 2 days (normal)
    expect(
      getDealUrgency({ stage: 'active_offer', offerExpiresAt: daysFromNow(2) })
    ).toBe('normal');

    // Escrow closing in 5 days (soon)
    expect(
      getDealUrgency({ stage: 'in_escrow', contractClosingDate: daysFromNow(5) })
    ).toBe('soon');

    // Escrow closing in 16 days (normal)
    expect(
      getDealUrgency({ stage: 'in_escrow', contractClosingDate: daysFromNow(16) })
    ).toBe('normal');

    // Closed deal (closed)
    expect(getDealUrgency({ stage: 'closed' })).toBe('closed');
  });

  it('getDealCardModel respects role-based commission and never leaks private notes', () => {
    const harborDeal = DEALS.find((d) => d.id === 'deal_harbor_218');
    const lastMsg = getLastMessage(INITIAL_MESSAGES, 'deal_harbor_218');

    // Buyer model
    const buyerModel = getDealCardModel('buyer', harborDeal, {
      lastMessage: lastMsg,
      participants: PARTICIPANTS,
    });
    expect(buyerModel.commission).toBeUndefined();
    expect(buyerModel.offerAmount).toBe(1325000);
    expect(buyerModel.lastMessage).not.toBeNull();
    expect(buyerModel.lastMessage.senderFirstName).toBeDefined();

    // Lender model
    const lenderModel = getDealCardModel('lender', harborDeal, {
      lastMessage: lastMsg,
      participants: PARTICIPANTS,
    });
    expect(lenderModel.commission).toBeUndefined();
    expect(lenderModel.offerAmount).toBe(1325000);

    // Seller model
    const sellerModel = getDealCardModel('seller', harborDeal, {
      lastMessage: lastMsg,
      participants: PARTICIPANTS,
    });
    expect(sellerModel.commission).toBeDefined();
    expect(sellerModel.commission.amount).toBe(33125);

    // Agent model
    const agentModel = getDealCardModel('agent', harborDeal, {
      lastMessage: lastMsg,
      participants: PARTICIPANTS,
    });
    expect(agentModel.commission).toBeDefined();
    expect(agentModel.commission.amount).toBe(33125);

    // JSON.stringify of every role's model never contains privateAgentNotes
    const privatePhrases = [
      'Seller wants firm escrow close before month-end',
      'All-cash offer with expedited appraisal waiver',
      'HOA resale certification package requested',
      'Counter-offer #1 pending buyer signature',
      'Transaction funded and recorded',
    ];

    ['agent', 'buyer', 'seller', 'lender'].forEach((role) => {
      DEALS.forEach((deal) => {
        const model = getDealCardModel(role, deal, {
          lastMessage: getLastMessage(INITIAL_MESSAGES, deal.id),
          participants: PARTICIPANTS,
        });
        if (model) {
          const serialized = JSON.stringify(model);
          expect(serialized).not.toContain('privateAgentNotes');
          privatePhrases.forEach((phrase) => {
            expect(serialized).not.toContain(phrase);
          });
        }
      });
    });
  });
});
