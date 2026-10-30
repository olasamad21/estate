import { describe, it, expect } from 'vitest';
import { DEALS } from '../mock/deals.js';
import { INITIAL_ALERTS, SIMULATED_LEAD_TEMPLATE } from '../mock/alerts.js';
import { PERMISSIONS, ROLE_DETAILS, PARTICIPANTS } from '../mock/roles.js';
import { getVisibleDeals, canAccessDeal, getVisibleAlerts, getRoleSafeDeal } from '../utils/access.js';
import { getStageLabel, daysFromNow, hoursFromNow } from '../utils/formatters.js';
import {
  getAccessDeniedMessage,
  getSimulatedLeadMessage,
  getLeadPhase7Message,
  getAllNotificationsReadMessage,
  getFeedbackSavedMessage,
  getFeedbackCopiedMessage,
  getFeedbackCopyFailedMessage,
  getDemoResetMessage,
} from '../utils/messages.js';

describe('1. Role Matrix - Visible Deals & Access', () => {
  it('Agent sees all 5 deals', () => {
    const deals = getVisibleDeals('agent', DEALS);
    expect(deals.map((d) => d.id)).toEqual([
      'deal_harbor_218',
      'deal_crestwood_740',
      'deal_meadowbrook_104',
      'deal_aspen_512',
      'deal_stclaire_890',
    ]);
  });

  it('Buyer sees harbor_218, meadowbrook_104, stclaire_890', () => {
    const deals = getVisibleDeals('buyer', DEALS);
    expect(deals.map((d) => d.id)).toEqual([
      'deal_harbor_218',
      'deal_meadowbrook_104',
      'deal_stclaire_890',
    ]);
  });

  it('Seller sees harbor_218, crestwood_740, stclaire_890', () => {
    const deals = getVisibleDeals('seller', DEALS);
    expect(deals.map((d) => d.id)).toEqual([
      'deal_harbor_218',
      'deal_crestwood_740',
      'deal_stclaire_890',
    ]);
  });

  it('Lender sees harbor_218, aspen_512', () => {
    const deals = getVisibleDeals('lender', DEALS);
    expect(deals.map((d) => d.id)).toEqual([
      'deal_harbor_218',
      'deal_aspen_512',
    ]);
  });

  it('canAccessDeal enforces hardcoded role boundaries', () => {
    // Inaccessible deals:
    expect(canAccessDeal('buyer', 'deal_crestwood_740', DEALS)).toBe(false);
    expect(canAccessDeal('buyer', 'deal_aspen_512', DEALS)).toBe(false);
    expect(canAccessDeal('seller', 'deal_aspen_512', DEALS)).toBe(false);
    expect(canAccessDeal('seller', 'deal_meadowbrook_104', DEALS)).toBe(false);
    expect(canAccessDeal('lender', 'deal_crestwood_740', DEALS)).toBe(false);
    expect(canAccessDeal('lender', 'deal_meadowbrook_104', DEALS)).toBe(false);
    expect(canAccessDeal('lender', 'deal_stclaire_890', DEALS)).toBe(false);

    // Accessible deals:
    expect(canAccessDeal('agent', 'deal_harbor_218', DEALS)).toBe(true);
    expect(canAccessDeal('agent', 'deal_crestwood_740', DEALS)).toBe(true);
    expect(canAccessDeal('buyer', 'deal_harbor_218', DEALS)).toBe(true);
    expect(canAccessDeal('buyer', 'deal_meadowbrook_104', DEALS)).toBe(true);
    expect(canAccessDeal('seller', 'deal_crestwood_740', DEALS)).toBe(true);
    expect(canAccessDeal('seller', 'deal_stclaire_890', DEALS)).toBe(true);
    expect(canAccessDeal('lender', 'deal_aspen_512', DEALS)).toBe(true);
  });
});

describe('2. Leak Checks', () => {
  const privatePhrases = [
    'Seller wants firm escrow close before month-end',
    'All-cash offer with expedited appraisal waiver',
    'HOA resale certification package requested',
    'Counter-offer #1 pending buyer signature',
    'Transaction funded and recorded',
  ];

  it('Buyer and Lender deals contain no commission or private notes', () => {
    for (const role of ['buyer', 'lender']) {
      const serialized = JSON.stringify(getVisibleDeals(role, DEALS));
      expect(serialized).not.toContain('commissionRate');
      expect(serialized).not.toContain('commissionAmount');
      expect(serialized).not.toContain('privateAgentNotes');
      privatePhrases.forEach((phrase) => {
        expect(serialized).not.toContain(phrase);
      });
    }
  });

  it('Seller contains commission but no private notes', () => {
    const serialized = JSON.stringify(getVisibleDeals('seller', DEALS));
    expect(serialized).toContain('commissionAmount');
    expect(serialized).not.toContain('privateAgentNotes');
    privatePhrases.forEach((phrase) => {
      expect(serialized).not.toContain(phrase);
    });
  });

  it('Agent contains both commission and private notes', () => {
    const serialized = JSON.stringify(getVisibleDeals('agent', DEALS));
    expect(serialized).toContain('commissionAmount');
    expect(serialized).toContain('privateAgentNotes');
  });
});

describe('3. Alerts Verification', () => {
  const roles = ['agent', 'buyer', 'seller', 'lender'];

  it('every visible alert with a dealId belongs to hardcoded accessible deals for that role', () => {
    const ALLOWED_DEALS_BY_ROLE = {
      agent: ['deal_harbor_218', 'deal_crestwood_740', 'deal_meadowbrook_104', 'deal_aspen_512', 'deal_stclaire_890'],
      buyer: ['deal_harbor_218', 'deal_meadowbrook_104', 'deal_stclaire_890'],
      seller: ['deal_harbor_218', 'deal_crestwood_740', 'deal_stclaire_890'],
      lender: ['deal_harbor_218', 'deal_aspen_512'],
    };

    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, INITIAL_ALERTS, DEALS);
      visible.forEach((alert) => {
        if (alert.dealId) {
          expect(ALLOWED_DEALS_BY_ROLE[role]).toContain(alert.dealId);
        }
      });
    });
  });

  it('alerts for inaccessible deals are filtered out by canAccessDeal', () => {
    const dealAlert = {
      id: 'alt_test_aspen',
      type: 'deal_update',
      dealId: 'deal_aspen_512',
      title: 'Aspen Update',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const testAlerts = [dealAlert, ...INITIAL_ALERTS];
    const buyerVisible = getVisibleAlerts('buyer', testAlerts, DEALS);
    const sellerVisible = getVisibleAlerts('seller', testAlerts, DEALS);
    expect(buyerVisible.some((a) => a.id === 'alt_test_aspen')).toBe(false);
    expect(sellerVisible.some((a) => a.id === 'alt_test_aspen')).toBe(false);
  });

  it('targetRoles restricts visibility even when role has access to the deal', () => {
    // Harbor View (deal_harbor_218) has all 4 roles as participants
    const sellerAlerts = getVisibleAlerts('seller', INITIAL_ALERTS, DEALS);
    const lenderAlerts = getVisibleAlerts('lender', INITIAL_ALERTS, DEALS);
    const buyerAlerts = getVisibleAlerts('buyer', INITIAL_ALERTS, DEALS);

    // alt_002 is targeted only to agent and buyer: seller and lender must not see it
    expect(sellerAlerts.some((a) => a.id === 'alt_002')).toBe(false);
    expect(lenderAlerts.some((a) => a.id === 'alt_002')).toBe(false);

    // alt_006 is targeted only to agent and lender: buyer and seller must not see it
    expect(buyerAlerts.some((a) => a.id === 'alt_006')).toBe(false);
    expect(sellerAlerts.some((a) => a.id === 'alt_006')).toBe(false);
  });

  it('new_lead alerts only for roles with canSpawnFromLead', () => {
    const leadAlert = {
      id: 'alt_lead_test',
      type: 'new_lead',
      title: 'Inquiry',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const testAlerts = [leadAlert, ...INITIAL_ALERTS];
    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, testAlerts, DEALS);
      const hasLead = visible.some((a) => a.type === 'new_lead');
      const canSpawn = Boolean(PERMISSIONS[role]?.canSpawnFromLead);
      expect(hasLead).toBe(canSpawn);
    });
  });

  it('alert text never contains "commission" or private note text', () => {
    const privatePhrases = [
      'Seller wants firm escrow close before month-end',
      'All-cash offer with expedited appraisal waiver',
      'HOA resale certification package requested',
      'Counter-offer #1 pending buyer signature',
      'Transaction funded and recorded',
    ];

    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, INITIAL_ALERTS, DEALS);
      visible.forEach((alert) => {
        const text = `${alert.title} ${alert.description}`.toLowerCase();
        expect(text).not.toContain('commission');
        privatePhrases.forEach((phrase) => {
          expect(text).not.toContain(phrase.toLowerCase());
        });
      });
    });
  });

  it('list is sorted newest first', () => {
    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, INITIAL_ALERTS, DEALS);
      for (let i = 0; i < visible.length - 1; i++) {
        const timeA = new Date(visible[i].createdAt || visible[i].timestamp).getTime();
        const timeB = new Date(visible[i + 1].createdAt || visible[i + 1].timestamp).getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
      }
    });
  });

  it('every role has at least 2 visible alerts and at least 1 unread', () => {
    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, INITIAL_ALERTS, DEALS);
      expect(visible.length).toBeGreaterThanOrEqual(2);
      const unread = visible.filter((a) => !a.isRead).length;
      expect(unread).toBeGreaterThanOrEqual(1);
    });
  });

  it('unread count equals the number of unread visible alerts', () => {
    roles.forEach((role) => {
      const visible = getVisibleAlerts(role, INITIAL_ALERTS, DEALS);
      const unreadCount = visible.filter((a) => !a.isRead).length;
      expect(unreadCount).toBe(visible.filter((a) => a.isRead === false).length);
    });
  });
});

describe('4. getStageLabel Resolution', () => {
  it('handles in_escrow started 10 days ago (exact string)', () => {
    const deal = { stage: 'in_escrow', contractStartDate: daysFromNow(-10), escrowTotalDays: 30 };
    expect(getStageLabel(deal)).toBe('Under contract, Day 11/30');
  });

  it('handles in_escrow started today (exact string)', () => {
    const deal = { stage: 'in_escrow', contractStartDate: daysFromNow(0), escrowTotalDays: 30 };
    expect(getStageLabel(deal)).toBe('Under contract, Day 1/30');
  });

  it('handles active_offer responds today', () => {
    const deal = { stage: 'active_offer', offerExpiresAt: hoursFromNow(2) };
    expect(getStageLabel(deal)).toBe('Offer pending, responds today');
  });

  it('handles active_offer responds in 1 day', () => {
    const deal = { stage: 'active_offer', offerExpiresAt: daysFromNow(1) };
    expect(getStageLabel(deal)).toBe('Offer pending, responds in 1 day');
  });

  it('handles active_offer responds in 2 days', () => {
    const deal = { stage: 'active_offer', offerExpiresAt: daysFromNow(2) };
    expect(getStageLabel(deal)).toBe('Offer pending, responds in 2 days');
  });

  it('handles active_offer with missing offerExpiresAt returns "Offer pending"', () => {
    const deal = { stage: 'active_offer' };
    expect(getStageLabel(deal)).toBe('Offer pending');
  });

  it('handles closed deal', () => {
    const deal = { stage: 'closed', contractClosingDate: daysFromNow(-5) };
    expect(getStageLabel(deal)).toContain('Closed');
  });
});

describe('5. getRoleSafeDeal Copy & Immutability', () => {
  it('returns a copy so mutating the result does not change the source deal', () => {
    const original = { ...DEALS[0], privateAgentNotes: 'Confidential Notes' };
    const safe = getRoleSafeDeal('buyer', original);
    expect(safe.privateAgentNotes).toBeUndefined();
    expect(original.privateAgentNotes).toBe('Confidential Notes');

    safe.customInjectedProp = 'mutated';
    expect(original.customInjectedProp).toBeUndefined();
  });
});

describe('6. Permissions Matrix', () => {
  it("Lender uploads only 'financing'", () => {
    expect(PERMISSIONS.lender.allowedUploadCategories).toEqual(['financing']);
  });

  it('Buyer uploads nothing', () => {
    expect(PERMISSIONS.buyer.allowedUploadCategories).toEqual([]);
    expect(PERMISSIONS.buyer.canUploadContracts).toBe(false);
  });

  it('only Agent has canSpawnFromLead, canViewPrivateNotes, canRequestSignatures', () => {
    const roles = ['agent', 'buyer', 'seller', 'lender'];
    roles.forEach((role) => {
      const isAgent = role === 'agent';
      expect(Boolean(PERMISSIONS[role].canSpawnFromLead)).toBe(isAgent);
      expect(Boolean(PERMISSIONS[role].canViewPrivateNotes)).toBe(isAgent);
      expect(Boolean(PERMISSIONS[role].canRequestSignatures)).toBe(isAgent);
    });
  });
});

describe('7. User-Facing Messages & Sanitization (messages.js)', () => {
  const ID_TOKEN_REGEX = /[a-z]+_[a-z]*_?\d{2,3}/;

  it('all message generators produce no id-shaped tokens (/[a-z]+_[a-z]*_?\\d{2,3}/)', () => {
    const agentName = PARTICIPANTS.usr_sarah.name;
    const leadAddress = SIMULATED_LEAD_TEMPLATE.actionPayload.address;
    const samples = [
      getAccessDeniedMessage('Sarah Chen'),
      getAccessDeniedMessage('Elena Rostova'),
      getAccessDeniedMessage('David Kim'),
      getAccessDeniedMessage('Marcus Vance'),
      getAccessDeniedMessage(),
      getSimulatedLeadMessage(agentName, leadAddress, true),
      getSimulatedLeadMessage(agentName, leadAddress, false),
      getLeadPhase7Message(),
      getAllNotificationsReadMessage(),
      getFeedbackSavedMessage(),
      getFeedbackCopiedMessage(),
      getFeedbackCopyFailedMessage(),
      getDemoResetMessage(),
    ];

    samples.forEach((msg) => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
      expect(msg).not.toMatch(ID_TOKEN_REGEX);
    });
  });

  it('getAccessDeniedMessage contains no deal address or property fragments', () => {
    const addressWords = ['harbor', 'crestwood', 'meadowbrook', 'aspen', 'st. claire', 'lane', 'drive', 'way', 'avenue'];
    Object.values(ROLE_DETAILS).forEach((role) => {
      const msg = getAccessDeniedMessage(role.name);
      expect(msg).toBe(`${role.name} doesn't have access to that deal room. Back on Deals.`);
      addressWords.forEach((word) => {
        expect(msg.toLowerCase()).not.toContain(word);
      });
    });
  });

  it('getSimulatedLeadMessage formats correctly without id leaks', () => {
    const agentName = PARTICIPANTS.usr_sarah.name;
    const leadAddress = SIMULATED_LEAD_TEMPLATE.actionPayload.address;
    expect(getSimulatedLeadMessage(agentName, leadAddress, false)).toBe('New lead: 512 Aspen Ridge Way');
    expect(getSimulatedLeadMessage(agentName, leadAddress, true)).toBe('Switched to Sarah Chen (Agent). New lead: 512 Aspen Ridge Way.');
  });
});
