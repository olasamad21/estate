import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/storage';
import { DEALS } from '../mock/deals';
import { INITIAL_MESSAGES } from '../mock/messages';
import { INITIAL_DOCUMENTS } from '../mock/documents';
import { daysFromNow } from '../utils/formatters';

function createNewMessage(dealId, messageData) {
  return {
    id: `msg_${Date.now()}`,
    dealId,
    timestamp: new Date().toISOString(),
    type: 'user',
    ...messageData,
  };
}

function createNewDocument(dealId, docData) {
  return {
    id: `doc_${Date.now()}`,
    dealId,
    uploadDate: new Date().toISOString(),
    fileType: 'PDF',
    fileSize: '1.4 MB',
    status: 'pending_signatures',
    statusLabel: 'Uploaded & Awaiting Review',
    requiredSigners: ['agent', 'buyer'],
    signedByRoles: [],
    ...docData,
  };
}

function createSpawnedDeal(payload) {
  const spawnedId = `deal_spawned_${Date.now()}`;
  const newDeal = {
    id: spawnedId,
    listingId: payload.listingId || 'list_aspen',
    stage: 'active_offer',
    offerExpiresAt: daysFromNow(3),
    contractStartDate: new Date().toISOString(),
    escrowTotalDays: 30,
    contractClosingDate: daysFromNow(30),
    acceptedOfferPrice: 1120000,
    pendingOfferPrice: 1120000,
    commissionRate: 0.025,
    commissionAmount: 28000,
    privateAgentNotes: `Spawned from lead: ${payload.leadName || 'Inquiry'}. Budget: ${payload.offerBudget || '$1.1M'}.`,
    contingency: {
      type: 'inspection',
      title: 'Initial Buyer Walkthrough',
      dueDate: daysFromNow(5),
      status: 'pending',
    },
    participantIds: ['usr_sarah', 'usr_david'], // Default participants: Agent & Buyer
    lastActivityAt: new Date().toISOString(),
    unreadCountByRole: {
      agent: 1,
      buyer: 1,
      seller: 0,
      lender: 0,
    },
  };

  const initialMsg = {
    id: `msg_sp_${Date.now()}`,
    dealId: spawnedId,
    senderId: 'system',
    timestamp: new Date().toISOString(),
    type: 'system_event',
    content: `Deal Room created for ${payload.address || 'Property'}.`,
    systemEvent: {
      eventType: 'offer_submitted',
      iconName: 'FileCheck',
      badgeVariant: 'emerald',
      metadata: {
        label: 'Room Spawned from Lead',
      },
    },
  };

  return { newDeal, initialMsg, spawnedId };
}

const DealContext = createContext(null);

export function DealProvider({ children }) {
  // 1. Deals State
  const [deals, setDeals] = useState(() => {
    return safeLocalStorage.get('deals', DEALS);
  });

  useEffect(() => {
    safeLocalStorage.set('deals', deals);
  }, [deals]);

  // 2. Messages State (grouped by dealId)
  const [messages, setMessages] = useState(() => {
    return safeLocalStorage.get('messages', INITIAL_MESSAGES);
  });

  useEffect(() => {
    safeLocalStorage.set('messages', messages);
  }, [messages]);

  // 3. Documents State
  const [documents, setDocuments] = useState(() => {
    return safeLocalStorage.get('documents', INITIAL_DOCUMENTS);
  });

  useEffect(() => {
    safeLocalStorage.set('documents', documents);
  }, [documents]);

  // Message Appender
  const addMessage = useCallback((dealId, messageData) => {
    const newMessage = createNewMessage(dealId, messageData);

    setMessages((prev) => ({
      ...prev,
      [dealId]: [...(prev[dealId] || []), newMessage],
    }));

    // Update deal's lastActivityAt
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, lastActivityAt: newMessage.timestamp } : d
      )
    );

    return newMessage;
  }, []);

  // Document Uploader
  const addDocument = useCallback((dealId, docData) => {
    const newDoc = createNewDocument(dealId, docData);
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  // Spawn Deal Room from Lead
  const spawnDealFromLead = useCallback((leadAlert) => {
    const payload = leadAlert?.actionPayload || {};
    const { newDeal, initialMsg, spawnedId } = createSpawnedDeal(payload);

    setDeals((prev) => [newDeal, ...prev]);

    setMessages((prev) => ({
      ...prev,
      [spawnedId]: [initialMsg],
    }));

    return newDeal;
  }, []);

  // Reset helper
  const resetDealState = useCallback(() => {
    setDeals(DEALS);
    setMessages(INITIAL_MESSAGES);
    setDocuments(INITIAL_DOCUMENTS);
  }, []);

  const value = {
    deals,
    messages,
    documents,
    addMessage,
    addDocument,
    spawnDealFromLead,
    resetDealState,
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeals() {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeals must be used within a DealProvider');
  }
  return context;
}
