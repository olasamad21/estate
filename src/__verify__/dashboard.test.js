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

  it('exposes only active role unreadCount and never unreadCountByRole', () => {
    const harborDeal = DEALS.find((d) => d.id === 'deal_harbor_218');
    const agentModel = getDealCardModel('agent', harborDeal);
    const buyerModel = getDealCardModel('buyer', harborDeal);
    const sellerModel = getDealCardModel('seller', harborDeal);
    const lenderModel = getDealCardModel('lender', harborDeal);

    expect(agentModel.unreadCount).toBe(2);
    expect(buyerModel.unreadCount).toBe(1);
    expect(sellerModel.unreadCount).toBe(0);
    expect(lenderModel.unreadCount).toBe(1);

    ['agent', 'buyer', 'seller', 'lender'].forEach((role) => {
      const model = getDealCardModel(role, harborDeal);
      expect('unreadCountByRole' in model).toBe(false);
      expect(model.unreadCountByRole).toBeUndefined();
    });
  });

  it('calculates nextDeadline with exact strings for 0, 1, 3 days and null when absent', () => {
    // 0 days -> "due today"
    const dealToday = {
      id: 'test_deal_0',
      listingId: 'list_harbor',
      stage: 'in_escrow',
      contingency: {
        title: 'Appraisal Inspection',
        dueDate: daysFromNow(0),
        status: 'urgent',
      },
    };
    const modelToday = getDealCardModel('agent', dealToday);
    expect(modelToday.nextDeadline).toEqual({
      title: 'Appraisal Inspection',
      label: 'due today',
      urgent: true,
    });

    // 1 day -> "due tomorrow"
    const dealTomorrow = {
      id: 'test_deal_1',
      listingId: 'list_harbor',
      stage: 'in_escrow',
      contingency: {
        title: 'Loan Approval',
        dueDate: daysFromNow(1),
        status: 'pending',
      },
    };
    const modelTomorrow = getDealCardModel('agent', dealTomorrow);
    expect(modelTomorrow.nextDeadline).toEqual({
      title: 'Loan Approval',
      label: 'due tomorrow',
      urgent: false,
    });

    // 3 days -> "due in 3 days"
    const deal3Days = {
      id: 'test_deal_3',
      listingId: 'list_harbor',
      stage: 'in_escrow',
      contingency: {
        title: 'Physical Property Inspection',
        dueDate: daysFromNow(3),
        status: 'urgent',
      },
    };
    const model3Days = getDealCardModel('agent', deal3Days);
    expect(model3Days.nextDeadline).toEqual({
      title: 'Physical Property Inspection',
      label: 'due in 3 days',
      urgent: true,
    });

    // -1 day (past due) -> "overdue by 1 day", urgent: true
    const dealPast1 = {
      id: 'test_deal_past_1',
      listingId: 'list_harbor',
      stage: 'in_escrow',
      contingency: {
        title: 'Financing Commitment',
        dueDate: daysFromNow(-1),
        status: 'pending',
      },
    };
    const modelPast1 = getDealCardModel('agent', dealPast1);
    expect(modelPast1.nextDeadline).toEqual({
      title: 'Financing Commitment',
      label: 'overdue by 1 day',
      urgent: true,
    });

    // -3 days (past due) -> "overdue by 3 days", urgent: true
    const dealPast3 = {
      id: 'test_deal_past_3',
      listingId: 'list_harbor',
      stage: 'in_escrow',
      contingency: {
        title: 'HOA Document Review',
        dueDate: daysFromNow(-3),
        status: 'pending',
      },
    };
    const modelPast3 = getDealCardModel('agent', dealPast3);
    expect(modelPast3.nextDeadline).toEqual({
      title: 'HOA Document Review',
      label: 'overdue by 3 days',
      urgent: true,
    });

    // No contingency -> null
    const dealNoContingency = {
      id: 'test_deal_none',
      listingId: 'list_harbor',
      stage: 'in_escrow',
    };
    const modelNoContingency = getDealCardModel('agent', dealNoContingency);
    expect(modelNoContingency.nextDeadline).toBeNull();
  });

  it('asserts exact sorted key list of getDealCardModel for each of the 4 roles on deal_harbor_218', () => {
    const harborDeal = DEALS.find((d) => d.id === 'deal_harbor_218');
    const lastMsg = getLastMessage(INITIAL_MESSAGES, 'deal_harbor_218');

    const agentModel = getDealCardModel('agent', harborDeal, { lastMessage: lastMsg });
    const buyerModel = getDealCardModel('buyer', harborDeal, { lastMessage: lastMsg });
    const sellerModel = getDealCardModel('seller', harborDeal, { lastMessage: lastMsg });
    const lenderModel = getDealCardModel('lender', harborDeal, { lastMessage: lastMsg });

    expect(Object.keys(agentModel).sort()).toEqual([
      'address',
      'commission',
      'escrowProgress',
      'id',
      'lastMessage',
      'nextDeadline',
      'offerAmount',
      'participants',
      'priceLabel',
      'stage',
      'stageLabel',
      'unreadCount',
      'urgency',
    ]);

    expect(Object.keys(buyerModel).sort()).toEqual([
      'address',
      'escrowProgress',
      'id',
      'lastMessage',
      'nextDeadline',
      'offerAmount',
      'participants',
      'priceLabel',
      'stage',
      'stageLabel',
      'unreadCount',
      'urgency',
    ]);

    expect(Object.keys(sellerModel).sort()).toEqual([
      'address',
      'commission',
      'escrowProgress',
      'id',
      'lastMessage',
      'nextDeadline',
      'offerAmount',
      'participants',
      'priceLabel',
      'stage',
      'stageLabel',
      'unreadCount',
      'urgency',
    ]);

    expect(Object.keys(lenderModel).sort()).toEqual([
      'address',
      'escrowProgress',
      'id',
      'lastMessage',
      'nextDeadline',
      'offerAmount',
      'participants',
      'priceLabel',
      'stage',
      'stageLabel',
      'unreadCount',
      'urgency',
    ]);
  });

  it('assigns priceLabel per stage and enforces null nextDeadline for closed deals', () => {
    const harborDeal = DEALS.find((d) => d.id === 'deal_harbor_218');
    const aspenDeal = DEALS.find((d) => d.id === 'deal_aspen_512');
    const stclaireDeal = DEALS.find((d) => d.id === 'deal_stclaire_890');

    const harborModel = getDealCardModel('agent', harborDeal);
    expect(harborModel.priceLabel).toBe('Contract price');

    const aspenModel = getDealCardModel('agent', aspenDeal);
    expect(aspenModel.priceLabel).toBe('Offer');

    const stclaireModel = getDealCardModel('agent', stclaireDeal);
    expect(stclaireModel.priceLabel).toBe('Sold for');
    expect(stclaireModel.nextDeadline).toBeNull();
  });
});
