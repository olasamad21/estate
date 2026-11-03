import { minutesFromNow } from '../utils/formatters.js';
import { STAFF_BY_ID } from './staff.js';
import { callNameOf } from '../utils/chat.js';

export const RAW_SEED_MESSAGES = [
  // ==========================================
  // 1. #general (public, company-wide)
  // ==========================================
  {
    id: 'msg-gen-1',
    channelId: 'general',
    senderId: 'itivere',
    type: 'text',
    text: 'Reminder for all team leads: @Fortune @Uchechukwu weekly inspection and viewing logs are due by Friday 2:00 PM.',
    createdAt: minutesFromNow(-3500),
    reactions: {
      '\u{1F44D}': ['tamuno', 'fortune', 'uchechukwu'],
    },
  },
  {
    id: 'msg-gen-1-r1',
    channelId: 'general',
    parentId: 'msg-gen-1',
    senderId: 'tamuno',
    type: 'text',
    text: 'HQ viewing logs are compiled and submitted.',
    createdAt: minutesFromNow(-3400),
  },
  {
    id: 'msg-gen-1-r2',
    channelId: 'general',
    parentId: 'msg-gen-1',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Lugbe branch summary will be ready on time.',
    createdAt: minutesFromNow(-3300),
  },
  {
    id: 'msg-gen-2',
    channelId: 'general',
    senderId: 'ruth',
    type: 'text',
    text: 'Good morning team. Wishing everyone a productive week across our branches.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-gen-3',
    channelId: 'general',
    senderId: 'ahmed',
    type: 'text',
    text: 'Good morning all. Please keep client document records up to date.',
    createdAt: minutesFromNow(-2800),
  },
  {
    id: 'msg-gen-4',
    channelId: 'general',
    senderId: 'kingsley',
    type: 'text',
    text: '@Tamuno please is the field inspection vehicle booked for tomorrow morning?',
    createdAt: minutesFromNow(-2100),
  },
  {
    id: 'msg-gen-5',
    channelId: 'general',
    senderId: 'tamuno',
    type: 'text',
    text: 'The Toyota Hilux is reserved for field inspections from 9:00 AM to 1:00 PM.',
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-gen-6',
    channelId: 'general',
    senderId: 'kingsley',
    type: 'text',
    text: 'Understood. We will use the secondary vehicle for the afternoon schedule.',
    createdAt: minutesFromNow(-1900),
  },
  {
    id: 'msg-gen-7',
    channelId: 'general',
    senderId: 'christiana',
    type: 'text',
    text: '@Moshood fresh property presentation brochures have arrived at the front desk.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-gen-8',
    channelId: 'general',
    senderId: 'moshood',
    type: 'text',
    text: 'Thank you @Christiana. Field marketers will collect copies before departing for client meetings.',
    createdAt: minutesFromNow(-1100),
  },
  {
    id: 'msg-gen-9',
    channelId: 'general',
    senderId: 'chidinma',
    type: 'text',
    text: '@all All visitor badges and register entries for this morning have been logged.',
    createdAt: minutesFromNow(-45),
  },

  // ==========================================
  // 2. #announcements (announcement, managers & admin)
  // ==========================================
  {
    id: 'msg-ann-1',
    channelId: 'announcements',
    senderId: 'itivere',
    type: 'text',
    text: 'Official Notice: Company viewing guidelines updated. All agents must verify client identification before conducting off-site property inspections.',
    createdAt: minutesFromNow(-4500),
    pinned: true,
    seenBy: ['ruth', 'ahmed', 'itivere', 'fortune', 'tamuno', 'uchechukwu', 'ngozi', 'micheal', 'christy', 'oricha', 'taiye', 'nneke'],
    reactions: {
      '\u2705': ['tamuno', 'fortune', 'uchechukwu'],
    },
  },
  {
    id: 'msg-ann-1-r1',
    channelId: 'announcements',
    parentId: 'msg-ann-1',
    senderId: 'tamuno',
    type: 'text',
    text: 'Safety briefing on the new guidelines conducted with HQ marketing agents.',
    createdAt: minutesFromNow(-4400),
  },
  {
    id: 'msg-ann-2',
    channelId: 'announcements',
    senderId: 'ruth',
    type: 'text',
    text: 'Notice: Both branch offices and headquarters will observe standard operating hours throughout this month.',
    createdAt: minutesFromNow(-4000),
    seenBy: ['ahmed', 'itivere', 'fortune', 'tamuno', 'efosa', 'uchechukwu', 'ngozi', 'micheal'],
  },
  {
    id: 'msg-ann-3',
    channelId: 'announcements',
    senderId: 'fortune',
    type: 'text',
    text: 'Please join management in welcoming Gladys and Patience to our marketing and operations teams.',
    createdAt: minutesFromNow(-3100),
    seenBy: ['ruth', 'tamuno', 'uchechukwu', 'oricha', 'taiye', 'gladys', 'patience'],
  },
  {
    id: 'msg-ann-4',
    channelId: 'announcements',
    senderId: 'ahmed',
    type: 'text',
    text: 'Reminder: All corporate registry filings for current listings must follow the compliance checklist.',
    createdAt: minutesFromNow(-2200),
    seenBy: ['itivere', 'fortune', 'franca', 'faith', 'aniede', 'tamuno'],
  },
  {
    id: 'msg-ann-5',
    channelId: 'announcements',
    senderId: 'tamuno',
    type: 'text',
    text: 'Viewing Protocol: Agents scheduling weekend inspections must register appointments on Friday before 4:00 PM.',
    createdAt: minutesFromNow(-1800),
    seenBy: ['ruth', 'fortune', 'christy', 'uchechukwu', 'ngozi', 'oricha', 'taiye', 'nneke'],
  },
  {
    id: 'msg-ann-6',
    channelId: 'announcements',
    senderId: 'fortune',
    type: 'text',
    text: 'Holiday Notice: All offices will be closed on Monday for the scheduled public holiday. Emergency contact numbers remain active.',
    createdAt: minutesFromNow(-1650),
    seenBy: ['ruth', 'ahmed', 'itivere', 'tamuno', 'uchechukwu', 'ngozi', 'micheal', 'efosa', 'christy'],
  },
  {
    id: 'msg-ann-7',
    channelId: 'announcements',
    senderId: 'itivere',
    type: 'text',
    text: 'Office Management: Routine IT maintenance and cloud backup scheduled for Saturday evening.',
    createdAt: minutesFromNow(-1550),
    seenBy: ['ruth', 'ahmed', 'fortune', 'tamuno', 'franca', 'faith'],
  },
  {
    id: 'msg-ann-8',
    channelId: 'announcements',
    senderId: 'fortune',
    type: 'text',
    text: 'Management Notice: Client feedback forms must be submitted to administration within 24 hours of each viewing.',
    createdAt: minutesFromNow(-1460),
    seenBy: ['ruth', 'tamuno', 'christy', 'uchechukwu', 'ngozi', 'oricha'],
  },

  // ==========================================
  // 3. #hq-team (public, hq office)
  // ==========================================
  {
    id: 'msg-hqt-1',
    channelId: 'hq-team',
    senderId: 'tamuno',
    type: 'text',
    text: 'HQ weekly priorities: focus on diplomatic sector enquiries in Maitama and commercial space requests in Wuse 2.',
    createdAt: minutesFromNow(-4000),
    pinned: true,
    reactions: {
      '\u{1F44D}': ['christy', 'oricha', 'solomon'],
    },
  },
  {
    id: 'msg-hqt-1-r1',
    channelId: 'hq-team',
    parentId: 'msg-hqt-1',
    senderId: 'christy',
    type: 'text',
    text: 'Lead schedule compiled for both sectors.',
    createdAt: minutesFromNow(-3900),
  },
  {
    id: 'msg-hqt-1-r2',
    channelId: 'hq-team',
    parentId: 'msg-hqt-1',
    senderId: 'oricha',
    type: 'text',
    text: 'Diplomatic portfolio brochures ready for distribution.',
    createdAt: minutesFromNow(-3800),
  },
  {
    id: 'msg-hqt-listing',
    channelId: 'hq-team',
    senderId: 'tamuno',
    type: 'listing',
    listingChannelId: 'maitama-duplex',
    note: 'Maitama Duplex price anchored at ₦450m with Minister Consent verified. Ready for serious buyer offers.',
    createdAt: minutesFromNow(-3200),
  },
  {
    id: 'msg-hqt-2',
    channelId: 'hq-team',
    senderId: 'solomon',
    type: 'text',
    text: '@Oricha please verify the viewing schedule for the Maitama inspection this afternoon.',
    createdAt: minutesFromNow(-2600),
  },
  {
    id: 'msg-hqt-3',
    channelId: 'hq-team',
    senderId: 'oricha',
    type: 'text',
    text: 'Viewing confirmed for 2:30 PM. The client representative will meet us at the gate.',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-hqt-4',
    channelId: 'hq-team',
    senderId: 'isaac',
    type: 'text',
    text: 'HQ utility vehicle has been serviced and is available for field inspections.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-hqt-5',
    channelId: 'hq-team',
    senderId: 'semira',
    type: 'text',
    text: 'Updated title search documents for Wuse 2 properties have been picked up from the registry.',
    createdAt: minutesFromNow(-1400),
  },
  {
    id: 'msg-hqt-6',
    channelId: 'hq-team',
    senderId: 'maryam',
    type: 'text',
    text: '@Solomon I have prepared the property specification sheets for the new client walk-in.',
    createdAt: minutesFromNow(-900),
  },
  {
    id: 'msg-hqt-7',
    channelId: 'hq-team',
    senderId: 'christiana',
    type: 'text',
    text: 'Stationery and inspection clipboard supplies for HQ agents are stocked in cabinet B.',
    createdAt: minutesFromNow(-500),
  },
  {
    id: 'msg-hqt-8',
    channelId: 'hq-team',
    senderId: 'moshood',
    type: 'text',
    text: '@Oricha client feedback from the morning Maitama inspection has been filed with administration.',
    createdAt: minutesFromNow(-30),
  },

  // ==========================================
  // 4. #lugbe-team (public, lugbe office)
  // ==========================================
  {
    id: 'msg-lbt-1',
    channelId: 'lugbe-team',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Lugbe team notice: All site viewings along Airport Road must be logged in the branch register before departure.',
    createdAt: minutesFromNow(-4000),
    pinned: true,
    reactions: {
      '\u2705': ['taiye', 'george', 'peter'],
    },
  },
  {
    id: 'msg-lbt-1-r1',
    channelId: 'lugbe-team',
    parentId: 'msg-lbt-1',
    senderId: 'taiye',
    type: 'text',
    text: 'Airport Road viewing register updated for the week.',
    createdAt: minutesFromNow(-3900),
  },
  {
    id: 'msg-lbt-1-r2',
    channelId: 'lugbe-team',
    parentId: 'msg-lbt-1',
    senderId: 'george',
    type: 'text',
    text: 'Copy that. Field log signed.',
    createdAt: minutesFromNow(-3800),
  },
  {
    id: 'msg-lbt-file-pdf',
    channelId: 'lugbe-team',
    senderId: 'uchechukwu',
    type: 'file',
    fileName: 'Price_List_Lugbe.pdf',
    fileSize: '1.2 MB',
    fileKind: 'document',
    text: 'Price_List_Lugbe.pdf',
    caption: 'Updated price schedule for Lugbe Terraces phases 1 and 2.',
    createdAt: minutesFromNow(-3100),
  },
  {
    id: 'msg-lbt-2',
    channelId: 'lugbe-team',
    senderId: 'taiye',
    type: 'text',
    text: '@Zainab please confirm if the inspection vehicle is available for the 11:00 AM Lugbe Terraces walkthrough.',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-lbt-3',
    channelId: 'lugbe-team',
    senderId: 'zainab',
    type: 'text',
    text: 'The branch vehicle is fueled and ready at the parking bay.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-lbt-voice',
    channelId: 'lugbe-team',
    senderId: 'taiye',
    type: 'voice',
    durationSec: 28,
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-lbt-4',
    channelId: 'lugbe-team',
    senderId: 'peter',
    type: 'text',
    text: 'Completed the perimeter inspection at Airport Road Estate. Boundary beacons are clearly marked.',
    createdAt: minutesFromNow(-1300),
  },
  {
    id: 'msg-lbt-5',
    channelId: 'lugbe-team',
    senderId: 'olamilekan',
    type: 'text',
    text: 'Facility access keys for the commercial plots have been returned to the office key box.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-lbt-6',
    channelId: 'lugbe-team',
    senderId: 'patience',
    type: 'text',
    text: '@George new visitor registration forms and client receipts have been placed at reception.',
    createdAt: minutesFromNow(-400),
  },
  {
    id: 'msg-lbt-7',
    channelId: 'lugbe-team',
    senderId: 'george',
    type: 'text',
    text: '@Taiye client confirmed for 4:00 PM inspection at Lugbe Terraces unit 6.',
    createdAt: minutesFromNow(-25),
  },

  // ==========================================
  // 5. #port-harcourt-team (public, port-harcourt office)
  // ==========================================
  {
    id: 'msg-pht-1',
    channelId: 'port-harcourt-team',
    senderId: 'ngozi',
    type: 'text',
    text: 'Port Harcourt team focus: corporate enquiries in GRA Phase 2 and commercial warehousing in Trans-Amadi.',
    createdAt: minutesFromNow(-4000),
    pinned: true,
    reactions: {
      '\u{1F44D}': ['micheal', 'nneke', 'amarachi'],
    },
  },
  {
    id: 'msg-pht-1-r1',
    channelId: 'port-harcourt-team',
    parentId: 'msg-pht-1',
    senderId: 'micheal',
    type: 'text',
    text: 'Corporate client list reviewed with marketing agents.',
    createdAt: minutesFromNow(-3900),
  },
  {
    id: 'msg-pht-1-r2',
    channelId: 'port-harcourt-team',
    parentId: 'msg-pht-1',
    senderId: 'nneke',
    type: 'text',
    text: 'Inspection schedule prepared for both locations.',
    createdAt: minutesFromNow(-3800),
  },
  {
    id: 'msg-pht-listing',
    channelId: 'port-harcourt-team',
    senderId: 'micheal',
    type: 'listing',
    listingChannelId: 'gra-apartments',
    note: 'Executive apartments in GRA Phase 2 with Governor Consent ready for corporate inspections.',
    createdAt: minutesFromNow(-3200),
  },
  {
    id: 'msg-pht-file-pdf',
    channelId: 'port-harcourt-team',
    senderId: 'ngozi',
    type: 'file',
    fileName: 'Survey_Plan_Rumuola.pdf',
    fileSize: '2.8 MB',
    fileKind: 'document',
    text: 'Survey_Plan_Rumuola.pdf',
    caption: 'Survey plan showing boundary beacons for Rumuola plot.',
    createdAt: minutesFromNow(-2600),
  },
  {
    id: 'msg-pht-voice',
    channelId: 'port-harcourt-team',
    senderId: 'nneke',
    type: 'voice',
    durationSec: 35,
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-pht-2',
    channelId: 'port-harcourt-team',
    senderId: 'ndidiamaka',
    type: 'text',
    text: '@Progress please confirm gate pass clearance for tomorrow morning in Trans-Amadi.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-pht-3',
    channelId: 'port-harcourt-team',
    senderId: 'progress',
    type: 'text',
    text: 'Security clearance granted by the estate office. We can access the site from 8:30 AM.',
    createdAt: minutesFromNow(-1400),
  },
  {
    id: 'msg-pht-4',
    channelId: 'port-harcourt-team',
    senderId: 'amarachi',
    type: 'text',
    text: 'Survey verification at the lands registry in Rumuola confirmed clear title with no encumbrance.',
    createdAt: minutesFromNow(-900),
  },
  {
    id: 'msg-pht-5',
    channelId: 'port-harcourt-team',
    senderId: 'uche',
    type: 'text',
    text: '@Ngozi inspection vehicle serviced and ready for the weekend client appointments.',
    createdAt: minutesFromNow(-500),
  },
  {
    id: 'msg-pht-6',
    channelId: 'port-harcourt-team',
    senderId: 'precious',
    type: 'text',
    text: '@Nneke client confirmed they will review the GRA Phase 2 proposal this evening.',
    createdAt: minutesFromNow(-25),
  },

  // ==========================================
  // 6. #hq-leads (public, hq leads)
  // ==========================================
  {
    id: 'msg-hql-1',
    channelId: 'hq-leads',
    senderId: 'christy',
    type: 'lead',
    clientName: 'Senator Aliyu Garba',
    enquiry: 'Prime 6-bedroom ambassadorial mansion with guest chalet and pool in Maitama.',
    area: 'Maitama',
    budgetNgn: 1200000000,
    claimedById: 'oricha',
    claimedAt: minutesFromNow(-2500),
    createdAt: minutesFromNow(-2600),
  },
  {
    id: 'msg-hql-claim-1',
    channelId: 'hq-leads',
    senderId: 'oricha',
    type: 'system',
    text: 'Oricha took this lead',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-hql-2',
    channelId: 'hq-leads',
    senderId: 'oricha',
    type: 'text',
    text: 'Contacted Senator Garba representative. Inspection scheduled for tomorrow morning.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-hql-3',
    channelId: 'hq-leads',
    senderId: 'christy',
    type: 'lead',
    clientName: 'Hajiya Maryam Bello',
    enquiry: 'Spacious 5-bedroom fully detached duplex with BQ in diplomatic zone.',
    area: 'Maitama',
    budgetNgn: 550000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-hql-4',
    channelId: 'hq-leads',
    senderId: 'godwin',
    type: 'text',
    text: '@Christy I have two matching properties in our Maitama portfolio for this request.',
    createdAt: minutesFromNow(-1100),
  },
  {
    id: 'msg-hql-5',
    channelId: 'hq-leads',
    senderId: 'solomon',
    type: 'text',
    text: 'Let us confirm owner availability before assigning viewings.',
    createdAt: minutesFromNow(-900),
  },
  {
    id: 'msg-hql-6',
    channelId: 'hq-leads',
    senderId: 'christy',
    type: 'text',
    text: 'Owner confirmed inspection access between 10:00 AM and 2:00 PM.',
    createdAt: minutesFromNow(-500),
  },
  {
    id: 'msg-hql-7',
    channelId: 'hq-leads',
    senderId: 'christy',
    type: 'lead',
    clientName: 'Dr. Kabir Usman',
    enquiry: 'Modern 4-bedroom terrace duplex in a serviced residential court.',
    area: 'Wuse 2',
    budgetNgn: 280000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-20),
  },

  // ==========================================
  // 7. #lugbe-leads (public, lugbe leads)
  // ==========================================
  {
    id: 'msg-lbl-1',
    channelId: 'lugbe-leads',
    senderId: 'uchechukwu',
    type: 'lead',
    clientName: 'Alhaji Sanusi Lamido',
    enquiry: '3-bedroom semi-detached bungalow in a gated community along Airport Road.',
    area: 'Airport Road',
    budgetNgn: 75000000,
    claimedById: 'taiye',
    claimedAt: minutesFromNow(-2450),
    createdAt: minutesFromNow(-2600),
  },
  {
    id: 'msg-lbl-claim-1',
    channelId: 'lugbe-leads',
    senderId: 'taiye',
    type: 'system',
    text: 'Taiye took this lead',
    createdAt: minutesFromNow(-2450),
  },
  {
    id: 'msg-lbl-2',
    channelId: 'lugbe-leads',
    senderId: 'taiye',
    type: 'text',
    text: 'Spoke with Alhaji Lamido. He wants an inspection this Thursday afternoon.',
    createdAt: minutesFromNow(-2350),
  },
  {
    id: 'msg-lbl-3',
    channelId: 'lugbe-leads',
    senderId: 'uchechukwu',
    type: 'lead',
    clientName: 'Mrs. Ngozi Eze',
    enquiry: '4-bedroom terrace duplex with stable borehole and power supply in Lugbe.',
    area: 'Lugbe',
    budgetNgn: 65000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-1250),
  },
  {
    id: 'msg-lbl-4',
    channelId: 'lugbe-leads',
    senderId: 'zainab',
    type: 'text',
    text: '@Taiye can you confirm if unit 4 at Lugbe Terraces is still vacant for this budget?',
    createdAt: minutesFromNow(-1150),
  },
  {
    id: 'msg-lbl-5',
    channelId: 'lugbe-leads',
    senderId: 'george',
    type: 'text',
    text: 'Unit 4 is vacant and keys are with the facility security desk.',
    createdAt: minutesFromNow(-850),
  },
  {
    id: 'msg-lbl-6',
    channelId: 'lugbe-leads',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Please ensure viewing forms are signed on site before departure.',
    createdAt: minutesFromNow(-480),
  },
  {
    id: 'msg-lbl-7',
    channelId: 'lugbe-leads',
    senderId: 'uchechukwu',
    type: 'lead',
    clientName: 'Pastor Emmanuel Adeleke',
    enquiry: '2 plots of dry commercial land suitable for institutional development.',
    area: 'Kuje',
    budgetNgn: 90000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-25),
  },

  // ==========================================
  // 8. #port-harcourt-leads (public, ph leads)
  // ==========================================
  {
    id: 'msg-phl-1',
    channelId: 'port-harcourt-leads',
    senderId: 'ngozi',
    type: 'lead',
    clientName: 'Chief Diepriye Briggs',
    enquiry: 'Executive 5-bedroom detached mansion with penthouse and swimming pool.',
    area: 'GRA Phase 2',
    budgetNgn: 650000000,
    claimedById: 'nneke',
    claimedAt: minutesFromNow(-2480),
    createdAt: minutesFromNow(-2600),
  },
  {
    id: 'msg-phl-claim-1',
    channelId: 'port-harcourt-leads',
    senderId: 'nneke',
    type: 'system',
    text: 'Nneke took this lead',
    createdAt: minutesFromNow(-2480),
  },
  {
    id: 'msg-phl-2',
    channelId: 'port-harcourt-leads',
    senderId: 'nneke',
    type: 'text',
    text: 'Called Chief Briggs. We agreed to conduct the site walkthrough on Friday at 11:00 AM.',
    createdAt: minutesFromNow(-2380),
  },
  {
    id: 'msg-phl-3',
    channelId: 'port-harcourt-leads',
    senderId: 'ngozi',
    type: 'lead',
    clientName: 'Engr. Tari West',
    enquiry: 'Industrial warehouse and logistics yard with trailer access.',
    area: 'Trans-Amadi',
    budgetNgn: 450000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-1300),
  },
  {
    id: 'msg-phl-4',
    channelId: 'port-harcourt-leads',
    senderId: 'ndidiamaka',
    type: 'text',
    text: '@Nneke we have the Trans-Amadi logistics facility documentation ready at the office.',
    createdAt: minutesFromNow(-1100),
  },
  {
    id: 'msg-phl-5',
    channelId: 'port-harcourt-leads',
    senderId: 'progress',
    type: 'text',
    text: 'Road access confirmed clear for 40ft containers at the industrial park.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-phl-6',
    channelId: 'port-harcourt-leads',
    senderId: 'ngozi',
    type: 'text',
    text: 'Notify the facility manager in Trans-Amadi ahead of the visit.',
    createdAt: minutesFromNow(-450),
  },
  {
    id: 'msg-phl-7',
    channelId: 'port-harcourt-leads',
    senderId: 'ngozi',
    type: 'lead',
    clientName: 'Dr. (Mrs.) Blessing Amadi',
    enquiry: '4-bedroom serviced duplex within an executive residential enclave.',
    area: 'GRA Phase 2',
    budgetNgn: 240000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-30),
  },

  // ==========================================
  // 9. #management (private, management team)
  // ==========================================
  {
    id: 'msg-mgt-1',
    channelId: 'management',
    senderId: 'itivere',
    type: 'text',
    text: 'Management review: Monthly target for new listings is set at twelve verified properties across all branches.',
    createdAt: minutesFromNow(-3800),
    reactions: {
      '\u{1F44D}': ['tamuno', 'uchechukwu', 'ngozi'],
    },
  },
  {
    id: 'msg-mgt-1-r1',
    channelId: 'management',
    parentId: 'msg-mgt-1',
    senderId: 'tamuno',
    type: 'text',
    text: 'HQ pipeline currently has five properties under title search.',
    createdAt: minutesFromNow(-3700),
  },
  {
    id: 'msg-mgt-1-r2',
    channelId: 'management',
    parentId: 'msg-mgt-1',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Lugbe branch has four residential listings ready for onboarding.',
    createdAt: minutesFromNow(-3600),
  },
  {
    id: 'msg-mgt-2',
    channelId: 'management',
    senderId: 'ngozi',
    type: 'text',
    text: '@Ruth @Ahmed Port Harcourt branch update: commercial demand in Trans-Amadi remains strong this quarter.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-mgt-3',
    channelId: 'management',
    senderId: 'efosa',
    type: 'text',
    text: 'Field operations report: inspection vehicle maintenance completed for all branch units.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-mgt-4',
    channelId: 'management',
    senderId: 'micheal',
    type: 'text',
    text: '@Ngozi let us ensure viewing schedules for GRA Phase 2 do not clash on Saturday.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-mgt-5',
    channelId: 'management',
    senderId: 'tamuno',
    type: 'text',
    text: 'Viewing schedule conflict resolved: morning slot reserved for corporate buyers, afternoon for private clients.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-mgt-6',
    channelId: 'management',
    senderId: 'christy',
    type: 'text',
    text: 'HQ sales team has engaged eight qualified prospects for the diplomatic sector properties.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-mgt-7',
    channelId: 'management',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Lugbe team has conducted nine site walkthroughs over the past three days.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-mgt-8',
    channelId: 'management',
    senderId: 'fortune',
    type: 'text',
    text: 'Summary agenda for tomorrow morning executive briefing is now circulated.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 10. #sales (private, sales department)
  // ==========================================
  {
    id: 'msg-sal-1',
    channelId: 'sales',
    senderId: 'fortune',
    type: 'text',
    text: 'Sales reminder: Follow up with clients within 24 hours of their site inspection while impressions are fresh.',
    createdAt: minutesFromNow(-3800),
    reactions: {
      '\u{1F44D}': ['oricha', 'taiye', 'nneke'],
    },
  },
  {
    id: 'msg-sal-1-r1',
    channelId: 'sales',
    parentId: 'msg-sal-1',
    senderId: 'oricha',
    type: 'text',
    text: 'Follow-up protocol shared with the junior marketing team.',
    createdAt: minutesFromNow(-3700),
  },
  {
    id: 'msg-sal-1-r2',
    channelId: 'sales',
    parentId: 'msg-sal-1',
    senderId: 'taiye',
    type: 'text',
    text: 'Noted. Using the standardized client feedback sheet.',
    createdAt: minutesFromNow(-3600),
  },
  {
    id: 'msg-sal-listing',
    channelId: 'sales',
    senderId: 'uchechukwu',
    type: 'listing',
    listingChannelId: 'lugbe-terraces',
    note: 'Four units remaining at Lugbe Terraces. Title is verified and ready for client viewing.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-sal-file-pdf',
    channelId: 'sales',
    senderId: 'christy',
    type: 'file',
    fileName: 'Brochure_Maitama_Duplex.pdf',
    fileSize: '2.4 MB',
    fileKind: 'document',
    text: 'Brochure_Maitama_Duplex.pdf',
    caption: 'Marketing brochure with floor plans and payment structure.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-sal-2',
    channelId: 'sales',
    senderId: 'nneke',
    type: 'text',
    text: '@Fortune please confirm if the asking price on the Trans-Amadi suites includes service charges.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-sal-3',
    channelId: 'sales',
    senderId: 'ngozi',
    type: 'text',
    text: 'Service charge schedule is separate and available on request from facility management.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-sal-4',
    channelId: 'sales',
    senderId: 'zainab',
    type: 'text',
    text: 'Lugbe Terraces open house generated four strong buyer inquiries yesterday.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-sal-5',
    channelId: 'sales',
    senderId: 'oricha',
    type: 'text',
    text: 'Great work @Zainab. Let us maintain the momentum across all branches.',
    createdAt: minutesFromNow(-700),
  },
  {
    id: 'msg-sal-6',
    channelId: 'sales',
    senderId: 'amarachi',
    type: 'text',
    text: '@Ngozi Port Harcourt marketing team has lined up three private presentations for Thursday.',
    createdAt: minutesFromNow(-350),
  },
  {
    id: 'msg-sal-7',
    channelId: 'sales',
    senderId: 'ndidiamaka',
    type: 'text',
    text: 'Updated marketing slides for corporate client pitches have been downloaded.',
    createdAt: minutesFromNow(-35),
  },

  // ==========================================
  // 11. #field-operations (private, field operations)
  // ==========================================
  {
    id: 'msg-fop-1',
    channelId: 'field-operations',
    senderId: 'efosa',
    type: 'text',
    text: 'Field operations protocol: Conduct perimeter security checks and verify boundary beacons on all uncompleted plots.',
    createdAt: minutesFromNow(-3600),
    reactions: {
      '\u2705': ['isaac', 'kingsley', 'jatau'],
    },
  },
  {
    id: 'msg-fop-1-r1',
    channelId: 'field-operations',
    parentId: 'msg-fop-1',
    senderId: 'isaac',
    type: 'text',
    text: 'HQ perimeter inspections completed for this week.',
    createdAt: minutesFromNow(-3500),
  },
  {
    id: 'msg-fop-1-r2',
    channelId: 'field-operations',
    parentId: 'msg-fop-1',
    senderId: 'kingsley',
    type: 'text',
    text: 'Boundary beacons verified clear along the expressway corridor.',
    createdAt: minutesFromNow(-3400),
  },
  {
    id: 'msg-fop-file-pdf',
    channelId: 'field-operations',
    senderId: 'tamuno',
    type: 'file',
    fileName: 'Deed_of_Assignment_Draft.pdf',
    fileSize: '1.8 MB',
    fileKind: 'document',
    text: 'Deed_of_Assignment_Draft.pdf',
    caption: 'Draft deed of assignment ready for legal review.',
    createdAt: minutesFromNow(-2800),
  },
  {
    id: 'msg-fop-2',
    channelId: 'field-operations',
    senderId: 'jatau',
    type: 'text',
    text: '@Efosa access keys for the Wuse commercial building have been handed to facility security.',
    createdAt: minutesFromNow(-2200),
  },
  {
    id: 'msg-fop-3',
    channelId: 'field-operations',
    senderId: 'ibrahim',
    type: 'text',
    text: 'Routine security inspection completed at the Airport Road parcel. Site is fully secured.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-fop-4',
    channelId: 'field-operations',
    senderId: 'olamilekan',
    type: 'text',
    text: '@Tamuno vehicle maintenance checklist completed for both field utility trucks.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-fop-5',
    channelId: 'field-operations',
    senderId: 'uche',
    type: 'text',
    text: 'Trans-Amadi site walkthrough scheduled for Friday morning with the engineering survey team.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-fop-6',
    channelId: 'field-operations',
    senderId: 'joseph',
    type: 'text',
    text: 'All gate entry permits for next week inspections have been processed with estate offices.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-fop-7',
    channelId: 'field-operations',
    senderId: 'kingsley',
    type: 'text',
    text: 'Daily site report compiled and uploaded to the operations folder.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 12. #finance-admin (private, finance & admin)
  // ==========================================
  {
    id: 'msg-fin-1',
    channelId: 'finance-admin',
    senderId: 'franca',
    type: 'text',
    text: 'Accounts desk: Ensure all vendor invoices have proper purchase order references attached.',
    createdAt: minutesFromNow(-3600),
    reactions: {
      '\u{1F44D}': ['faith', 'imeh', 'aniede'],
    },
  },
  {
    id: 'msg-fin-2',
    channelId: 'finance-admin',
    senderId: 'aniede',
    type: 'text',
    text: '@Franca standard invoice templates have been refreshed for the current financial quarter.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-fin-file-pdf',
    channelId: 'finance-admin',
    senderId: 'franca',
    type: 'file',
    fileName: 'Receipt_Template.pdf',
    fileSize: '310 KB',
    fileKind: 'document',
    text: 'Receipt_Template.pdf',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-fin-3',
    channelId: 'finance-admin',
    senderId: 'imeh',
    type: 'text',
    text: '@Franca client payment confirmations for corporate agency retainers have been reconciled.',
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-fin-4',
    channelId: 'finance-admin',
    senderId: 'faith',
    type: 'text',
    text: 'Official receipt books dispatched to branch administrative coordinators.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-fin-5',
    channelId: 'finance-admin',
    senderId: 'biobelene',
    type: 'text',
    text: 'Auditing of administrative petty cash vouchers completed for all offices.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-fin-6',
    channelId: 'finance-admin',
    senderId: 'aniede',
    type: 'text',
    text: '@Faith please file the monthly utility bills for HQ and branch offices.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-fin-7',
    channelId: 'finance-admin',
    senderId: 'faith',
    type: 'text',
    text: 'Utility invoices reconciled and filed in the compliance records.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 13. #maitama-duplex (listing, hq)
  // ==========================================
  {
    id: 'msg-mtd-1',
    channelId: 'maitama-duplex',
    senderId: 'tamuno',
    type: 'text',
    text: 'Listing Details: 5-bedroom detached duplex in Maitama anchored at ₦450,000,000 with C of O and Minister Consent verified.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u{1F44D}': ['christy', 'oricha', 'solomon'],
    },
  },
  {
    id: 'msg-mtd-2',
    channelId: 'maitama-duplex',
    senderId: 'christy',
    type: 'text',
    text: 'Owner confirmed willingness to consider reasonable structured offers close to the ₦450m asking price.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-mtd-3',
    channelId: 'maitama-duplex',
    senderId: 'oricha',
    type: 'text',
    text: 'Title search at the land registry confirmed Minister Consent and registered Deed of Assignment are intact.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-mtd-photo',
    channelId: 'maitama-duplex',
    senderId: 'tamuno',
    type: 'file',
    fileName: 'Living_Room.jpg',
    fileSize: '3.1 MB',
    fileKind: 'photo',
    text: 'Living_Room.jpg',
    caption: 'Main living room interior showing marble floor finishing.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-mtd-4',
    channelId: 'maitama-duplex',
    senderId: 'solomon',
    type: 'text',
    text: '@Oricha has the diplomatic client confirmed their viewing slot for this property?',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-mtd-5',
    channelId: 'maitama-duplex',
    senderId: 'oricha',
    type: 'text',
    text: 'Viewing scheduled for tomorrow at 11:30 AM with the embassy facilities manager.',
    createdAt: minutesFromNow(-900),
  },
  {
    id: 'msg-mtd-6',
    channelId: 'maitama-duplex',
    senderId: 'maryam',
    type: 'text',
    text: 'Survey plan coordinates verified on site and boundary beacons are intact.',
    createdAt: minutesFromNow(-500),
  },
  {
    id: 'msg-mtd-7',
    channelId: 'maitama-duplex',
    senderId: 'solomon',
    type: 'text',
    text: 'Facility walkthrough completed before tomorrow client visit. All utilities operational.',
    createdAt: minutesFromNow(-15),
  },

  // ==========================================
  // 14. #wuse-office-block (listing, hq)
  // ==========================================
  {
    id: 'msg-wob-1',
    channelId: 'wuse-office-block',
    senderId: 'christy',
    type: 'text',
    text: 'Commercial Listing: 4-storey modern office complex in Wuse 2 priced at ₦620,000,000. Suitable for bank or corporate headquarters.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
  },
  {
    id: 'msg-wob-2',
    channelId: 'wuse-office-block',
    senderId: 'tamuno',
    type: 'text',
    text: 'Title documents include valid C of O, approved building plan and registered Minister Consent.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-wob-3',
    channelId: 'wuse-office-block',
    senderId: 'oricha',
    type: 'text',
    text: 'Corporate banking client requested an inspection to evaluate executive floor layout.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-wob-photo',
    channelId: 'wuse-office-block',
    senderId: 'christy',
    type: 'file',
    fileName: 'Front_Elevation.jpg',
    fileSize: '4.2 MB',
    fileKind: 'photo',
    text: 'Front_Elevation.jpg',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-wob-4',
    channelId: 'wuse-office-block',
    senderId: 'godwin',
    type: 'text',
    text: '@Oricha inspection access confirmed with the building facility manager for Thursday morning.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-wob-5',
    channelId: 'wuse-office-block',
    senderId: 'solomon',
    type: 'text',
    text: 'Survey plan confirms 1,800 square meters plot area with ample dedicated customer parking.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-wob-6',
    channelId: 'wuse-office-block',
    senderId: 'chidinma',
    type: 'text',
    text: 'Brochures detailing floor space and lease options delivered to client representatives.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-wob-7',
    channelId: 'wuse-office-block',
    senderId: 'divine',
    type: 'text',
    text: '@Tamuno client facility team completed structural assessment and gave positive initial feedback.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 15. #lugbe-terraces (listing, lugbe)
  // ==========================================
  {
    id: 'msg-lbt-lst-1',
    channelId: 'lugbe-terraces',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Residential Listing: 4-bedroom terrace units at Lugbe Terraces priced at ₦85,000,000 each with verified C of O and Minister Consent.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u2705': ['taiye', 'george', 'peter'],
    },
  },
  {
    id: 'msg-lbt-lst-2',
    channelId: 'lugbe-terraces',
    senderId: 'taiye',
    type: 'text',
    text: 'Four units currently available for immediate handover upon completion of transaction.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-lbt-lst-3',
    channelId: 'lugbe-terraces',
    senderId: 'george',
    type: 'text',
    text: 'Survey plan and Deed of Assignment draft reviewed and verified clear of any third-party claim.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-lbt-lst-photo',
    channelId: 'lugbe-terraces',
    senderId: 'uchechukwu',
    type: 'file',
    fileName: 'Terrace_Exterior.jpg',
    fileSize: '3.6 MB',
    fileKind: 'photo',
    text: 'Terrace_Exterior.jpg',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-lbt-lst-4',
    channelId: 'lugbe-terraces',
    senderId: 'zainab',
    type: 'text',
    text: '@Taiye two prospective buyers have requested afternoon viewings this weekend.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-lbt-lst-5',
    channelId: 'lugbe-terraces',
    senderId: 'taiye',
    type: 'text',
    text: 'Viewings booked for Saturday at 1:00 PM and 3:00 PM respectively.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-lbt-lst-6',
    channelId: 'lugbe-terraces',
    senderId: 'peter',
    type: 'text',
    text: 'Estate transformer and borehole supply tested and fully operational across all terrace units.',
    createdAt: minutesFromNow(-400),
  },
  {
    id: 'msg-lbt-lst-7',
    channelId: 'lugbe-terraces',
    senderId: 'olamilekan',
    type: 'text',
    text: '@Uchechukwu keys for unit 3 and unit 5 checked out for the morning client walk-through.',
    createdAt: minutesFromNow(-15),
  },

  // ==========================================
  // 16. #airport-road-estate (listing, lugbe)
  // ==========================================
  {
    id: 'msg-are-1',
    channelId: 'airport-road-estate',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Estate Parcel Listing: Gated development along Airport Road priced at ₦140,000,000 with C of O and Minister Consent.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
  },
  {
    id: 'msg-are-2',
    channelId: 'airport-road-estate',
    senderId: 'taiye',
    type: 'text',
    text: 'Plot layout supports 8 semi-detached residential units with perimeter fence completed.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-are-3',
    channelId: 'airport-road-estate',
    senderId: 'george',
    type: 'text',
    text: 'Registered survey plan confirms exact acreage and boundary corner beacons are clearly visible.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-are-photo',
    channelId: 'airport-road-estate',
    senderId: 'uchechukwu',
    type: 'file',
    fileName: 'Site_Layout.jpg',
    fileSize: '2.9 MB',
    fileKind: 'photo',
    text: 'Site_Layout.jpg',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-are-4',
    channelId: 'airport-road-estate',
    senderId: 'peter',
    type: 'text',
    text: '@Taiye institutional developer expressed interest in acquiring the parcel for staff housing.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-are-5',
    channelId: 'airport-road-estate',
    senderId: 'taiye',
    type: 'text',
    text: 'Meeting scheduled with developer project team at our Lugbe office on Friday.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-are-6',
    channelId: 'airport-road-estate',
    senderId: 'zainab',
    type: 'text',
    text: 'Draft Deed of Assignment and land registry verification documents packaged for the meeting.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-are-7',
    channelId: 'airport-road-estate',
    senderId: 'patience',
    type: 'text',
    text: 'Client registration forms for the developer representatives prepared at reception.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 17. #gra-apartments (listing, port-harcourt)
  // ==========================================
  {
    id: 'msg-gra-1',
    channelId: 'gra-apartments',
    senderId: 'micheal',
    type: 'text',
    text: 'Executive Listing: Serviced 3-bedroom luxury apartments in GRA Phase 2 priced at ₦210,000,000 with Governor Consent.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u{1F44D}': ['ngozi', 'nneke', 'amarachi'],
    },
  },
  {
    id: 'msg-gra-2',
    channelId: 'gra-apartments',
    senderId: 'ngozi',
    type: 'text',
    text: 'Corporate energy firm requested inspection for senior expatriate residential quarters.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-gra-3',
    channelId: 'gra-apartments',
    senderId: 'nneke',
    type: 'text',
    text: 'Title search at the state ministry of lands confirms Governor Consent and registered C of O.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-gra-photo',
    channelId: 'gra-apartments',
    senderId: 'micheal',
    type: 'file',
    fileName: 'Apartment_Block.jpg',
    fileSize: '3.4 MB',
    fileKind: 'photo',
    text: 'Apartment_Block.jpg',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-gra-4',
    channelId: 'gra-apartments',
    senderId: 'amarachi',
    type: 'text',
    text: '@Nneke corporate inspection confirmed for Thursday at 2:00 PM.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-gra-5',
    channelId: 'gra-apartments',
    senderId: 'progress',
    type: 'text',
    text: 'Dedicated power generator and security gate access verified with facility managers.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-gra-6',
    channelId: 'gra-apartments',
    senderId: 'uche',
    type: 'text',
    text: 'Estate access clearance passes arranged for client vehicles.',
    createdAt: minutesFromNow(-400),
  },
  {
    id: 'msg-gra-7',
    channelId: 'gra-apartments',
    senderId: 'precious',
    type: 'text',
    text: 'Client relocation manager confirmed inspection party of three arriving tomorrow.',
    createdAt: minutesFromNow(-20),
  },

  // ==========================================
  // 18. #trans-amadi-suites (listing, port-harcourt)
  // ==========================================
  {
    id: 'msg-tas-1',
    channelId: 'trans-amadi-suites',
    senderId: 'ngozi',
    type: 'text',
    text: 'Commercial Listing: Modern office suites along Trans-Amadi priced at ₦320,000,000 with C of O and Governor Consent.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
  },
  {
    id: 'msg-tas-2',
    channelId: 'trans-amadi-suites',
    senderId: 'micheal',
    type: 'text',
    text: 'Property features dedicated transformer, heavy-duty logistics access and 24-hour industrial security.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-tas-3',
    channelId: 'trans-amadi-suites',
    senderId: 'nneke',
    type: 'text',
    text: 'Title documentation and Deed of Assignment draft inspected and ready for buyer legal counsel.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-tas-photo',
    channelId: 'trans-amadi-suites',
    senderId: 'ngozi',
    type: 'file',
    fileName: 'Office_Suites.jpg',
    fileSize: '3.8 MB',
    fileKind: 'photo',
    text: 'Office_Suites.jpg',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-tas-4',
    channelId: 'trans-amadi-suites',
    senderId: 'progress',
    type: 'text',
    text: '@Nneke logistics company representative requested inspection of ground floor warehouse bays.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-tas-5',
    channelId: 'trans-amadi-suites',
    senderId: 'ndidiamaka',
    type: 'text',
    text: 'Inspection conducted successfully. Client requested tenancy lease terms as an alternative to outright purchase.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-tas-6',
    channelId: 'trans-amadi-suites',
    senderId: 'amarachi',
    type: 'text',
    text: 'Survey plan verification confirmed 2,200 square meters commercial plot footprint.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-tas-7',
    channelId: 'trans-amadi-suites',
    senderId: 'glory',
    type: 'text',
    text: 'Client feedback summary uploaded to the Trans-Amadi transaction dossier.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 19. #dm-micheal-ngozi (dm, micheal & ngozi)
  // ==========================================
  {
    id: 'msg-dmn-1',
    channelId: 'dm-micheal-ngozi',
    senderId: 'micheal',
    type: 'text',
    text: 'Good morning Ngozi. Have you reviewed the corporate proposal for GRA Phase 2?',
    createdAt: minutesFromNow(-3200),
  },
  {
    id: 'msg-dmn-2',
    channelId: 'dm-micheal-ngozi',
    senderId: 'ngozi',
    type: 'text',
    text: 'Good morning Micheal. Yes, the terms look sound. We need to confirm parking allocation.',
    createdAt: minutesFromNow(-3100),
  },
  {
    id: 'msg-dmn-3',
    channelId: 'dm-micheal-ngozi',
    senderId: 'micheal',
    type: 'text',
    text: 'The facility manager confirmed four dedicated bays per apartment unit.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-dmn-4',
    channelId: 'dm-micheal-ngozi',
    senderId: 'ngozi',
    type: 'text',
    text: 'That meets their requirements. I will notify the client legal officer.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-dmn-5',
    channelId: 'dm-micheal-ngozi',
    senderId: 'micheal',
    type: 'text',
    text: 'Also, what is the status of the Trans-Amadi survey plan search?',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-dmn-6',
    channelId: 'dm-micheal-ngozi',
    senderId: 'ngozi',
    type: 'text',
    text: 'Registry confirmation came through this morning. Everything is clear.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-dmn-7',
    channelId: 'dm-micheal-ngozi',
    senderId: 'micheal',
    type: 'text',
    text: 'Excellent. Let us finalize the client briefing before the close of business.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-dmn-8',
    channelId: 'dm-micheal-ngozi',
    senderId: 'ngozi',
    type: 'text',
    text: 'Meeting pack printed and ready on your desk.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 20. #dm-efosa-uchechukwu (dm, efosa & uchechukwu)
  // ==========================================
  {
    id: 'msg-dme-1',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Hello Efosa. How is the vehicle schedule for Lugbe inspections looking this week?',
    createdAt: minutesFromNow(-3200),
  },
  {
    id: 'msg-dme-2',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'efosa',
    type: 'text',
    text: 'Hello Uchechukwu. Both utility vehicles are serviced and cleared for field duty.',
    createdAt: minutesFromNow(-3100),
  },
  {
    id: 'msg-dme-3',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'We have heavy viewing bookings on Thursday and Saturday along Airport Road.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-dme-4',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'efosa',
    type: 'text',
    text: 'I have allocated the Toyota Hilux specifically for the Airport Road team on those days.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-dme-5',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Thank you. Did Kingsley complete the boundary beacon checks at Lugbe Terraces?',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-dme-6',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'efosa',
    type: 'text',
    text: 'Yes, all corner beacons are tagged and photographed.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-dme-7',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Great. Please ensure fuel vouchers are signed off before tomorrow morning.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-dme-8',
    channelId: 'dm-efosa-uchechukwu',
    senderId: 'efosa',
    type: 'text',
    text: 'All vouchers approved and filed with accounts.',
    createdAt: minutesFromNow(-1460),
  },

  // ==========================================
  // 21. #lugbe-viewing-team (group, lugbe viewing team)
  // ==========================================
  {
    id: 'msg-lvt-1',
    channelId: 'lugbe-viewing-team',
    senderId: 'taiye',
    type: 'text',
    text: 'Team, we have 4 client inspections scheduled for Lugbe Terraces this Thursday.',
    createdAt: minutesFromNow(-3200),
  },
  {
    id: 'msg-lvt-2',
    channelId: 'lugbe-viewing-team',
    senderId: 'george',
    type: 'text',
    text: 'I will be on site from 10:00 AM to ensure gates and terrace units are open.',
    createdAt: minutesFromNow(-3100),
  },
  {
    id: 'msg-lvt-3',
    channelId: 'lugbe-viewing-team',
    senderId: 'zainab',
    type: 'text',
    text: '@George please confirm that the backup generator has sufficient diesel for the demonstration.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-lvt-4',
    channelId: 'lugbe-viewing-team',
    senderId: 'george',
    type: 'text',
    text: 'Generator tank topped up and serviced yesterday. Everything is working.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-lvt-5',
    channelId: 'lugbe-viewing-team',
    senderId: 'peter',
    type: 'text',
    text: 'What time is the Airport Road Estate walkthrough scheduled for Friday?',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-lvt-6',
    channelId: 'lugbe-viewing-team',
    senderId: 'taiye',
    type: 'text',
    text: 'Airport Road inspection starts at 2:00 PM. We will meet the developer representatives at the main junction.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-lvt-7',
    channelId: 'lugbe-viewing-team',
    senderId: 'efosa',
    type: 'text',
    text: 'Inspection vehicle will be waiting at the branch office by 1:30 PM.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-lvt-8',
    channelId: 'lugbe-viewing-team',
    senderId: 'peter',
    type: 'text',
    text: 'Viewing clipboards, route maps and site registers are ready.',
    createdAt: minutesFromNow(-1460),
  },
];

export function retimeToOfficeHours(messages = []) {
  if (!Array.isArray(messages)) return [];

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  // Group messages by channel and calendar day
  const channelDayGroups = {};

  messages.forEach((msg, idx) => {
    // Lead messages are timed with minutesFromNow as usual, do not retime
    if (msg.type === 'lead') return;

    const d = new Date(msg.createdAt);
    const y = d.getFullYear();
    const m = d.getMonth();
    const dt = d.getDate();
    const key = `${msg.channelId}__${y}_${m}_${dt}`;

    if (!channelDayGroups[key]) {
      channelDayGroups[key] = {
        channelId: msg.channelId,
        year: y,
        month: m,
        date: dt,
        items: [],
      };
    }
    channelDayGroups[key].items.push({ msg, originalIndex: idx });
  });

  const updatedTimestamps = new Map();

  // Process each channel-day group
  Object.values(channelDayGroups).forEach((group) => {
    const { year, month, date, items } = group;
    const count = items.length;
    const isToday = year === todayYear && month === todayMonth && date === todayDate;

    // Window: 08:00 (480 mins) to 18:30 (1110 mins) -> 630 minutes total span
    const startMins = 480;
    const totalSpan = 630;

    let prevMs = 0;

    items.forEach((item, i) => {
      const remainingThatDay = count - 1 - i;
      // Fractional step across the working day
      const fraction = count > 1 ? i / (count - 1) : 0.35;
      const baseMinutes = startMins + Math.floor(fraction * totalSpan);

      // Deterministic jitter between 1 and 3 minutes derived from item.originalIndex
      const jitter = ((item.originalIndex * 7 + 3) % 3) + 1;
      const computedMinuteOfDay = Math.min(1110, baseMinutes + jitter);

      const hour = Math.floor(computedMinuteOfDay / 60);
      const minute = computedMinuteOfDay % 60;
      const second = (item.originalIndex * 17) % 60;

      // Numeric Date construction only: (year, month, date, hours, minutes, seconds)
      let candidate = new Date(year, month, date, hour, minute, second);
      let candidateMs = candidate.getTime();

      // Today check: messages from today must never be in the future
      if (isToday) {
        const maxAllowedMs = now.getTime() - remainingThatDay * 4 * 60 * 1000 - 30000;
        if (candidateMs > maxAllowedMs) {
          candidateMs = maxAllowedMs;
        }
      }

      // Ensure strictly ascending order within the day
      if (prevMs > 0 && candidateMs <= prevMs) {
        candidateMs = prevMs + 60 * 1000 + (jitter * 1000);
      }

      // Thread parent ordering check: thread reply must remain after parent
      if (item.msg.parentId && updatedTimestamps.has(item.msg.parentId)) {
        const parentIso = updatedTimestamps.get(item.msg.parentId);
        const parentMs = new Date(parentIso).getTime();
        if (candidateMs <= parentMs) {
          candidateMs = parentMs + 90 * 1000 + (jitter * 1000);
        }
      }

      prevMs = candidateMs;
      updatedTimestamps.set(item.msg.id, new Date(candidateMs).toISOString());
    });
  });

  // Return rewritten messages with updated timestamps
  const retimed = messages.map((msg) => {
    if (updatedTimestamps.has(msg.id)) {
      return {
        ...msg,
        createdAt: updatedTimestamps.get(msg.id),
      };
    }
    return msg;
  });

  // Ensure claimed leads have claimedAt set from retimed claim system message
  for (let i = 0; i < retimed.length; i++) {
    const msg = retimed[i];
    if (msg.type === 'lead' && msg.claimedById) {
      const claimer = STAFF_BY_ID[msg.claimedById];
      const claimerCallName = claimer ? callNameOf(claimer) : msg.claimedById;

      const sysMsg = retimed.find(
        (m, idx) =>
          idx > i &&
          m.channelId === msg.channelId &&
          m.type === 'system' &&
          m.text.includes('took this lead')
      );
      if (sysMsg) {
        sysMsg.text = `${claimerCallName} took this lead`;
        msg.claimedAt = sysMsg.createdAt;
      }
    }
  }

  return retimed;
}

export const SEED_MESSAGES = retimeToOfficeHours(RAW_SEED_MESSAGES);



