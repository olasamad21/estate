import { minutesFromNow } from '../utils/formatters.js';
import { STAFF_BY_ID } from './staff.js';
import { callNameOf } from '../utils/chat.js';
import { COMPANY_CONFIG } from '../config/market.js';

const hqConsent = COMPANY_CONFIG.offices?.find((o) => o.id === 'hq')?.consentLabel || "Minister's Consent";
const lugbeConsent = COMPANY_CONFIG.offices?.find((o) => o.id === 'lugbe')?.consentLabel || "Minister's Consent";

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
    text: 'Reminder: All corporate registry filings for current properties must follow the compliance checklist.',
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
  // 9. #management (private, management team)
  // ==========================================
  {
    id: 'msg-mgt-1',
    channelId: 'management',
    senderId: 'itivere',
    type: 'text',
    text: 'Management review: Monthly target for new properties is set at twelve verified properties across all branches.',
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
    text: 'Lugbe branch has four residential properties ready for onboarding.',
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
    id: 'msg-sal-lead-1',
    channelId: 'sales',
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
    id: 'msg-sal-claim-1',
    channelId: 'sales',
    senderId: 'oricha',
    type: 'system',
    text: 'Oricha took this lead',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-sal-lead-r1',
    channelId: 'sales',
    senderId: 'oricha',
    type: 'text',
    text: 'Contacted Senator Garba representative. Inspection scheduled for tomorrow morning.',
    createdAt: minutesFromNow(-2450),
  },
  {
    id: 'msg-sal-lead-2',
    channelId: 'sales',
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
    id: 'msg-sal-lead-3',
    channelId: 'sales',
    senderId: 'ngozi',
    type: 'lead',
    clientName: 'Chief Emeka Okonkwo',
    enquiry: 'Modern commercial office suites or corporate facility along Trans-Amadi.',
    area: 'Trans-Amadi',
    budgetNgn: 350000000,
    claimedById: null,
    claimedAt: null,
    createdAt: minutesFromNow(-600),
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
  // 6. #land-title-documents (private, authorized personnel only)
  // ==========================================
  {
    id: 'msg-ltd-1',
    channelId: 'land-title-documents',
    senderId: 'ahmed',
    type: 'text',
    text: 'Land title repository: All C of O, registered Deeds of Assignment, and Governor / Minister Consent documents must be verified and logged here.',
    createdAt: minutesFromNow(-3800),
    pinned: true,
    reactions: {
      '\u2705': ['ruth', 'tamuno', 'biobelene'],
    },
  },
  {
    id: 'msg-ltd-1-r1',
    channelId: 'land-title-documents',
    parentId: 'msg-ltd-1',
    senderId: 'tamuno',
    type: 'text',
    text: 'Maitama plot survey plan and Minister Consent verification confirmed clear at AGIS.',
    createdAt: minutesFromNow(-3600),
  },
  {
    id: 'msg-ltd-file-pdf',
    channelId: 'land-title-documents',
    senderId: 'ahmed',
    type: 'file',
    fileName: 'Survey_Plan_Maitama_Plot.pdf',
    fileSize: '3.2 MB',
    fileKind: 'document',
    text: 'Survey_Plan_Maitama_Plot.pdf',
    caption: 'Registered survey plan with AGIS coordinate verification.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-ltd-2',
    channelId: 'land-title-documents',
    senderId: 'biobelene',
    type: 'text',
    text: '@Ahmed the certified true copy of Governor Consent for the Rivers State property has arrived from the Port Harcourt Lands Ministry.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-ltd-3',
    channelId: 'land-title-documents',
    senderId: 'micheal',
    type: 'text',
    text: 'Confirmed. The deed was registered at the Port Harcourt Lands Registry under Volume 142.',
    createdAt: minutesFromNow(-2100),
  },
  {
    id: 'msg-ltd-4',
    channelId: 'land-title-documents',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Lugbe perimeter land excision gazette number has been cross-checked and filed in the document room.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-ltd-5',
    channelId: 'land-title-documents',
    senderId: 'ruth',
    type: 'text',
    text: 'Ensure all original title certificates are kept in the bank vault with digital copies archived here.',
    createdAt: minutesFromNow(-750),
  },

  // ==========================================
  // 7. #finance-accounts (private, finance team & management)
  // ==========================================
  {
    id: 'msg-fin-1',
    channelId: 'finance-accounts',
    senderId: 'franca',
    type: 'text',
    text: 'Accounts desk: Ensure all vendor invoices, client deposit receipts, and commission vouchers have proper transaction references attached.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u{1F44D}': ['faith', 'imeh', 'aniede'],
    },
  },
  {
    id: 'msg-fin-file-pdf',
    channelId: 'finance-accounts',
    senderId: 'franca',
    type: 'file',
    fileName: 'Receipt_Template.pdf',
    fileSize: '310 KB',
    fileKind: 'document',
    text: 'Receipt_Template.pdf',
    caption: 'Official corporate receipt voucher template for agency retainers.',
    createdAt: minutesFromNow(-3000),
  },
  {
    id: 'msg-fin-2',
    channelId: 'finance-accounts',
    senderId: 'aniede',
    type: 'text',
    text: '@Franca standard invoice templates have been refreshed for the current financial quarter.',
    createdAt: minutesFromNow(-2500),
  },
  {
    id: 'msg-fin-3',
    channelId: 'finance-accounts',
    senderId: 'imeh',
    type: 'text',
    text: '@Franca client payment confirmations for corporate agency retainers have been reconciled.',
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-fin-4',
    channelId: 'finance-accounts',
    senderId: 'faith',
    type: 'text',
    text: 'Official receipt books and deposit registers dispatched to branch administrative coordinators.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-fin-5',
    channelId: 'finance-accounts',
    senderId: 'biobelene',
    type: 'text',
    text: 'Auditing of administrative petty cash vouchers completed for all offices.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-fin-6',
    channelId: 'finance-accounts',
    senderId: 'franca',
    type: 'text',
    text: 'Commission breakdown for the closed Lugbe transaction has been computed and queued for executive sign-off.',
    createdAt: minutesFromNow(-600),
  },
  {
    id: 'msg-fin-7',
    channelId: 'finance-accounts',
    senderId: 'faith',
    type: 'text',
    text: 'Monthly utility and diesel invoices for HQ and branch offices reconciled and filed.',
    createdAt: minutesFromNow(-80),
  },

  // ==========================================
  // 8. #hr-confidential (private, HR & management)
  // ==========================================
  {
    id: 'msg-hrc-1',
    channelId: 'hr-confidential',
    senderId: 'imeh',
    type: 'text',
    text: 'HR Notice: Mid-year performance evaluations and staff appraisals commence next Monday. All supervisors should prepare reviews.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u2705': ['ruth', 'franca', 'itivere'],
    },
  },
  {
    id: 'msg-hrc-file-pdf',
    channelId: 'hr-confidential',
    senderId: 'imeh',
    type: 'file',
    fileName: 'Staff_Handbook_2026.pdf',
    fileSize: '1.9 MB',
    fileKind: 'document',
    text: 'Staff_Handbook_2026.pdf',
    caption: 'Revised staff handbook covering employee code of conduct and leave policy.',
    createdAt: minutesFromNow(-2900),
  },
  {
    id: 'msg-hrc-2',
    channelId: 'hr-confidential',
    senderId: 'franca',
    type: 'text',
    text: '@Imeh salary schedules and PAYE deductions for the current cycle are finalized.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-hrc-3',
    channelId: 'hr-confidential',
    senderId: 'ruth',
    type: 'text',
    text: 'Please confirm onboarding schedule for the newly recruited marketers in Lugbe.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-hrc-4',
    channelId: 'hr-confidential',
    senderId: 'imeh',
    type: 'text',
    text: 'Onboarding session is set for Wednesday 10:00 AM. Facility tour and workspace allocation completed.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-hrc-5',
    channelId: 'hr-confidential',
    senderId: 'biobelene',
    type: 'text',
    text: 'Annual leave calendar updated with approved dates for Q3.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-hrc-6',
    channelId: 'hr-confidential',
    senderId: 'itivere',
    type: 'text',
    text: 'Management has approved the health and safety training workshop for all operations personnel.',
    createdAt: minutesFromNow(-200),
  },

  // ==========================================
  // 9. #it-support (public, all staff)
  // ==========================================
  {
    id: 'msg-its-1',
    channelId: 'it-support',
    senderId: 'moshood',
    type: 'text',
    text: 'IT Helpdesk: For email password resets, app permissions, CRM access, or network troubleshooting, post your request here.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
  },
  {
    id: 'msg-its-file-pdf',
    channelId: 'it-support',
    senderId: 'moshood',
    type: 'file',
    fileName: 'VPN_and_Email_Setup_Guide.pdf',
    fileSize: '1.2 MB',
    fileKind: 'document',
    text: 'VPN_and_Email_Setup_Guide.pdf',
    caption: 'Step-by-step setup guide for company email and secure workspace on mobile and desktop.',
    createdAt: minutesFromNow(-2800),
  },
  {
    id: 'msg-its-2',
    channelId: 'it-support',
    senderId: 'taiye',
    type: 'text',
    text: '@Moshood please assist with resetting the printer connection in the Lugbe branch office.',
    createdAt: minutesFromNow(-2200),
  },
  {
    id: 'msg-its-3',
    channelId: 'it-support',
    senderId: 'moshood',
    type: 'text',
    text: '@Taiye Lugbe network printer IP has been reconfigured. Please restart your print spooler.',
    createdAt: minutesFromNow(-2100),
  },
  {
    id: 'msg-its-4',
    channelId: 'it-support',
    senderId: 'taiye',
    type: 'text',
    text: 'Test page printed successfully. Thank you @Moshood.',
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-its-5',
    channelId: 'it-support',
    senderId: 'divine',
    type: 'text',
    text: 'Routine backup of staff mailboxes and document repositories completed at 2:00 AM.',
    createdAt: minutesFromNow(-1400),
  },
  {
    id: 'msg-its-6',
    channelId: 'it-support',
    senderId: 'semira',
    type: 'text',
    text: '@Divine HQ conference room projector screen has been calibrated for tomorrow presentations.',
    createdAt: minutesFromNow(-850),
  },
  {
    id: 'msg-its-7',
    channelId: 'it-support',
    senderId: 'kingsley',
    type: 'text',
    text: 'Field operations tablet updated with the latest offline site inspection form.',
    createdAt: minutesFromNow(-120),
  },

  // ==========================================
  // 10. #legal-compliance (private, legal team & management)
  // ==========================================
  {
    id: 'msg-leg-1',
    channelId: 'legal-compliance',
    senderId: 'ahmed',
    type: 'text',
    text: 'Legal & Compliance Desk: SCUML anti-money laundering reporting requirements must be adhered to for all property sales above statutory thresholds.',
    createdAt: minutesFromNow(-3600),
    pinned: true,
    reactions: {
      '\u2705': ['ruth', 'itivere', 'tamuno'],
    },
  },
  {
    id: 'msg-leg-file-pdf',
    channelId: 'legal-compliance',
    senderId: 'ahmed',
    type: 'file',
    fileName: 'SCUML_Compliance_Declaration.pdf',
    fileSize: '1.5 MB',
    fileKind: 'document',
    text: 'SCUML_Compliance_Declaration.pdf',
    caption: 'Mandatory SCUML compliance declaration form for high-value transactions.',
    createdAt: minutesFromNow(-2900),
  },
  {
    id: 'msg-leg-2',
    channelId: 'legal-compliance',
    senderId: 'tamuno',
    type: 'text',
    text: '@Ahmed the vetting of the tenancy agreement for the diplomatic tenant in Maitama is completed.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-leg-3',
    channelId: 'legal-compliance',
    senderId: 'ahmed',
    type: 'text',
    text: 'Noted. Clause 14 regarding service charge arbitration was adjusted to standard practice.',
    createdAt: minutesFromNow(-2200),
  },
  {
    id: 'msg-leg-4',
    channelId: 'legal-compliance',
    senderId: 'micheal',
    type: 'text',
    text: 'Port Harcourt title search at the Ministry of Lands confirmed no pending litigation on the Trans-Amadi parcel.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-leg-5',
    channelId: 'legal-compliance',
    senderId: 'ruth',
    type: 'text',
    text: 'All branch managers must ensure client KYC documentation is 100% complete before signing contracts.',
    createdAt: minutesFromNow(-800),
  },
  {
    id: 'msg-leg-6',
    channelId: 'legal-compliance',
    senderId: 'biobelene',
    type: 'text',
    text: 'Corporate affairs commission (CAC) status searches for corporate buyers have been archived.',
    createdAt: minutesFromNow(-150),
  },

  // ==========================================
  // 10. Sites & Property Rooms Seed Messages
  // ==========================================

  // --- Site 1: NAF Valley (Maitama) (#site-naf-valley) ---
  {
    id: 'msg-m2-1',
    channelId: 'site-naf-valley',
    senderId: 'tamuno',
    type: 'text',
    text: `Site operations notice: Perimeter security fencing and gatehouse construction for NAF Valley (Maitama) have been certified under ${hqConsent} documentation.`,
    createdAt: minutesFromNow(-3600),
    pinned: true,
  },
  {
    id: 'msg-m2-2',
    channelId: 'site-naf-valley',
    senderId: 'isaac',
    type: 'text',
    text: 'Survey beacons for Blocks A and B verified on site yesterday. Boundary line pegs are all marked.',
    createdAt: minutesFromNow(-2400),
  },
  {
    id: 'msg-m2-3',
    channelId: 'site-naf-valley',
    senderId: 'jatau',
    type: 'text',
    text: 'Security access gate is fully operational. Field agents coordinating viewings should check in at the main gate.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-m2-4',
    channelId: 'site-naf-valley',
    senderId: 'ibrahim',
    type: 'text',
    text: 'Central water trenching connection along the secondary access road begins tomorrow morning.',
    createdAt: minutesFromNow(-600),
  },
  {
    id: 'msg-m2-5',
    channelId: 'site-naf-valley',
    senderId: 'tamuno',
    type: 'text',
    text: 'Weekly site walkthrough scheduled for Thursday at 10:00 AM. Team leads should confirm attendance.',
    createdAt: minutesFromNow(-40),
  },

  // --- Site 2: Lavender Grove (Apo) (#site-lavender-grove) ---
  {
    id: 'msg-apo-1',
    channelId: 'site-lavender-grove',
    senderId: 'tamuno',
    type: 'text',
    text: `Engineering update: Drainage channels and access road paving for Lavender Grove (Apo) development certified under ${hqConsent}.`,
    createdAt: minutesFromNow(-3400),
    pinned: true,
  },
  {
    id: 'msg-apo-2',
    channelId: 'site-lavender-grove',
    senderId: 'isaac',
    type: 'text',
    text: 'Electrification poles installed and cabling run to the central distribution transformer.',
    createdAt: minutesFromNow(-2200),
  },
  {
    id: 'msg-apo-3',
    channelId: 'site-lavender-grove',
    senderId: 'jatau',
    type: 'text',
    text: 'Terrace foundation checks complete. Viewing access from the Apo expressway entry is clear.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-apo-4',
    channelId: 'site-lavender-grove',
    senderId: 'tamuno',
    type: 'text',
    text: 'On-site facilities management desk is open weekdays from 8:00 AM for incoming viewings.',
    createdAt: minutesFromNow(-500),
  },
  {
    id: 'msg-apo-5',
    channelId: 'site-lavender-grove',
    senderId: 'isaac',
    type: 'text',
    text: 'Water borehole test pumping completed with excellent flow rate.',
    createdAt: minutesFromNow(-30),
  },

  // --- Site 3: The Embassy (Apo) (#site-the-embassy) ---
  {
    id: 'msg-emb-1',
    channelId: 'site-the-embassy',
    senderId: 'tamuno',
    type: 'text',
    text: `Master planning update: Commercial plot zoning and diplomatic access corridor for The Embassy (Apo) certified under ${hqConsent}.`,
    createdAt: minutesFromNow(-3350),
    pinned: true,
  },
  {
    id: 'msg-emb-2',
    channelId: 'site-the-embassy',
    senderId: 'isaac',
    type: 'text',
    text: 'Cadastral beacons and boundary demarcation pegs inspected with town planning officials.',
    createdAt: minutesFromNow(-2150),
  },
  {
    id: 'msg-emb-3',
    channelId: 'site-the-embassy',
    senderId: 'jatau',
    type: 'text',
    text: 'Security gatehouse and dual-lane access boulevard grading completed.',
    createdAt: minutesFromNow(-1150),
  },
  {
    id: 'msg-emb-4',
    channelId: 'site-the-embassy',
    senderId: 'tamuno',
    type: 'text',
    text: 'VIP investor inspection scheduled for Friday afternoon. Escort protocol confirmed.',
    createdAt: minutesFromNow(-480),
  },
  {
    id: 'msg-emb-5',
    channelId: 'site-the-embassy',
    senderId: 'isaac',
    type: 'text',
    text: 'Site perimeter lighting and solar backup system operational.',
    createdAt: minutesFromNow(-28),
  },

  // --- Site 4: Elysian Fort (Ketti-Kabusa) (#site-elysian-fort) ---
  {
    id: 'msg-kk-1',
    channelId: 'site-elysian-fort',
    senderId: 'tamuno',
    type: 'text',
    text: `Land registry update: Cadastral coordinates and boundary beacons for Elysian Fort (Ketti-Kabusa) logged under ${hqConsent}.`,
    createdAt: minutesFromNow(-3500),
    pinned: true,
  },
  {
    id: 'msg-kk-2',
    channelId: 'site-elysian-fort',
    senderId: 'isaac',
    type: 'text',
    text: 'Survey beacons across Plots 1 to 25 verified and beacon numbers painted clearly.',
    createdAt: minutesFromNow(-2300),
  },
  {
    id: 'msg-kk-3',
    channelId: 'site-elysian-fort',
    senderId: 'jatau',
    type: 'text',
    text: 'Primary spine road earthwork completed. Access is smooth for inspection vehicles.',
    createdAt: minutesFromNow(-1400),
  },
  {
    id: 'msg-kk-4',
    channelId: 'site-elysian-fort',
    senderId: 'ibrahim',
    type: 'text',
    text: 'Perimeter fencing along the southern boundary line commences on Friday.',
    createdAt: minutesFromNow(-550),
  },
  {
    id: 'msg-kk-5',
    channelId: 'site-elysian-fort',
    senderId: 'tamuno',
    type: 'text',
    text: 'Client site viewing convoy departs HQ every Saturday at 11:00 AM.',
    createdAt: minutesFromNow(-35),
  },

  // --- Site 5: Dominion Villa (Ketti-Kabusa) (#site-dominion-villa) ---
  {
    id: 'msg-dv-1',
    channelId: 'site-dominion-villa',
    senderId: 'tamuno',
    type: 'text',
    text: `Site development status: Exclusive villa plots and gated perimeter layout for Dominion Villa (Ketti-Kabusa) approved under ${hqConsent}.`,
    createdAt: minutesFromNow(-3450),
    pinned: true,
  },
  {
    id: 'msg-dv-2',
    channelId: 'site-dominion-villa',
    senderId: 'isaac',
    type: 'text',
    text: 'Plot 22 and neighbouring corner-piece boundary pillars verified and documented.',
    createdAt: minutesFromNow(-2250),
  },
  {
    id: 'msg-dv-3',
    channelId: 'site-dominion-villa',
    senderId: 'jatau',
    type: 'text',
    text: 'Main gatehouse stone cladding finished. Private driveway grading complete.',
    createdAt: minutesFromNow(-1350),
  },
  {
    id: 'msg-dv-4',
    channelId: 'site-dominion-villa',
    senderId: 'ibrahim',
    type: 'text',
    text: 'Underground conduit laying for estate power and smart streetlights underway.',
    createdAt: minutesFromNow(-520),
  },
  {
    id: 'msg-dv-5',
    channelId: 'site-dominion-villa',
    senderId: 'tamuno',
    type: 'text',
    text: 'Private viewing appointments for premium plots open from this Thursday.',
    createdAt: minutesFromNow(-32),
  },

  // --- Site 6: Sancta Ville (Pyakasa 2) (#site-sancta-ville) ---
  {
    id: 'msg-p2-1',
    channelId: 'site-sancta-ville',
    senderId: 'efosa',
    type: 'text',
    text: `Infrastructure update: Phase 1 culvert drainage and earthworks completed under verified ${lugbeConsent} documentation.`,
    createdAt: minutesFromNow(-3200),
    pinned: true,
  },
  {
    id: 'msg-p2-2',
    channelId: 'site-sancta-ville',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Survey beacons across Plots 21 to 35 tagged with high-visibility markers for prospective buyers.',
    createdAt: minutesFromNow(-2000),
  },
  {
    id: 'msg-p2-3',
    channelId: 'site-sancta-ville',
    senderId: 'godwin',
    type: 'text',
    text: 'Access road grading from the expressway junction is completed. Saloon cars can drive in smoothly.',
    createdAt: minutesFromNow(-1100),
  },
  {
    id: 'msg-p2-4',
    channelId: 'site-sancta-ville',
    senderId: 'george',
    type: 'text',
    text: 'Site security update: Solar perimeter lights are operational along the main spine road.',
    createdAt: minutesFromNow(-450),
  },
  {
    id: 'msg-p2-5',
    channelId: 'site-sancta-ville',
    senderId: 'efosa',
    type: 'text',
    text: 'Foundation concrete pour for the terrace block commences on Wednesday.',
    createdAt: minutesFromNow(-25),
  },

  // --- Site 7: Upper Heaven (Kabusa) (#site-upper-heaven) ---
  {
    id: 'msg-kab-1',
    channelId: 'site-upper-heaven',
    senderId: 'efosa',
    type: 'text',
    text: `Operations notice: Compound boundary wall and estate gatehouse for Upper Heaven (Kabusa) have been certified under ${lugbeConsent}.`,
    createdAt: minutesFromNow(-3100),
    pinned: true,
  },
  {
    id: 'msg-kab-2',
    channelId: 'site-upper-heaven',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Detached duplex roofing inspected. Interior finishing work proceeding on schedule.',
    createdAt: minutesFromNow(-1950),
  },
  {
    id: 'msg-kab-3',
    channelId: 'site-upper-heaven',
    senderId: 'kingsley',
    type: 'text',
    text: 'Security personnel stationed at the main gate 24/7. Visitors badge system active.',
    createdAt: minutesFromNow(-1000),
  },
  {
    id: 'msg-kab-4',
    channelId: 'site-upper-heaven',
    senderId: 'joseph',
    type: 'text',
    text: 'Dedicated borehole water system operational and water treatment unit tested.',
    createdAt: minutesFromNow(-400),
  },
  {
    id: 'msg-kab-5',
    channelId: 'site-upper-heaven',
    senderId: 'efosa',
    type: 'text',
    text: 'Landscaping along the entry boulevard underway. Trees planted along the curb.',
    createdAt: minutesFromNow(-20),
  },

  // --- Site 8: Verola (Karshi) (#site-verola) ---
  {
    id: 'msg-kar-1',
    channelId: 'site-verola',
    senderId: 'efosa',
    type: 'text',
    text: `Commercial plaza vetting: Office suite floor layouts and MEP installations passed inspection under ${lugbeConsent}.`,
    createdAt: minutesFromNow(-3300),
    pinned: true,
  },
  {
    id: 'msg-kar-2',
    channelId: 'site-verola',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'High-speed fibre internet distribution ducting completed for all executive suites.',
    createdAt: minutesFromNow(-2100),
  },
  {
    id: 'msg-kar-3',
    channelId: 'site-verola',
    senderId: 'pawa',
    type: 'text',
    text: 'Backup generator test run successful. Automatic transfer switch functioning properly.',
    createdAt: minutesFromNow(-1150),
  },
  {
    id: 'msg-kar-4',
    channelId: 'site-verola',
    senderId: 'olamilekan',
    type: 'text',
    text: 'Commercial parking lot markings painted. Ample space for client vehicles.',
    createdAt: minutesFromNow(-420),
  },
  {
    id: 'msg-kar-5',
    channelId: 'site-verola',
    senderId: 'efosa',
    type: 'text',
    text: 'Facilities management reception is fully staffed and ready for incoming corporate viewings.',
    createdAt: minutesFromNow(-15),
  },

  // --- Garden Court Estate Property Rooms ---
  // 1. Block A, Flat 1
  {
    id: 'msg-gce-p1-1',
    channelId: 'prop-gce-block-a-flat-1',
    senderId: 'tamuno',
    type: 'text',
    text: 'Initial viewing availability is confirmed for weekday mornings between 9:00 AM and 12:00 PM.',
    createdAt: minutesFromNow(-1800),
  },
  {
    id: 'msg-gce-p1-photo',
    channelId: 'prop-gce-block-a-flat-1',
    senderId: 'isaac',
    type: 'file',
    fileName: 'living-room.jpg',
    fileSize: '2.8 MB',
    fileKind: 'photo',
    text: 'living-room.jpg',
    caption: 'Living room layout and balcony view showing natural lighting and tiled flooring.',
    createdAt: minutesFromNow(-1200),
  },
  {
    id: 'msg-gce-p1-2',
    channelId: 'prop-gce-block-a-flat-1',
    senderId: 'jatau',
    type: 'text',
    text: 'Document pack verified. Client requested confirmation of the service charge schedule.',
    createdAt: minutesFromNow(-500),
  },

  // 2. Block A, Flat 2
  {
    id: 'msg-gce-p2-1',
    channelId: 'prop-gce-block-a-flat-2',
    senderId: 'tamuno',
    type: 'text',
    text: 'Offer received from prospective buyer. Documentation currently with legal for initial vetting.',
    createdAt: minutesFromNow(-1600),
  },
  {
    id: 'msg-gce-p2-2',
    channelId: 'prop-gce-block-a-flat-2',
    senderId: 'oricha',
    type: 'text',
    text: 'Client requested viewing of the designated parking allocation layout before commitment.',
    createdAt: minutesFromNow(-700),
  },

  // 3. Block B, Penthouse
  {
    id: 'msg-gce-p3-1',
    channelId: 'prop-gce-block-b-penthouse',
    senderId: 'tamuno',
    type: 'text',
    text: 'Penthouse finishing specifications have been vetted by structural and interior consultants.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-gce-p3-doc',
    channelId: 'prop-gce-block-b-penthouse',
    senderId: 'isaac',
    type: 'file',
    fileName: 'penthouse-floor-plan.pdf',
    fileSize: '1.4 MB',
    fileKind: 'document',
    text: 'penthouse-floor-plan.pdf',
    caption: 'Architectural floor layout plan and terrace terrace dimensions.',
    createdAt: minutesFromNow(-1100),
  },
  {
    id: 'msg-gce-p3-2',
    channelId: 'prop-gce-block-b-penthouse',
    senderId: 'ibrahim',
    type: 'text',
    text: 'Private elevator access key card confirmed with on-site facilities management.',
    createdAt: minutesFromNow(-400),
  },

  // 4. Plot 7
  {
    id: 'msg-gce-p4-1',
    channelId: 'prop-gce-plot-7',
    senderId: 'tamuno',
    type: 'text',
    text: 'Plot transaction closed. Title documentation handed over to buyer legal counsel.',
    createdAt: minutesFromNow(-1500),
  },
  {
    id: 'msg-gce-p4-2',
    channelId: 'prop-gce-plot-7',
    senderId: 'isaac',
    type: 'text',
    text: 'Corner beacons demarcated with physical concrete pillars and marked on survey registry.',
    createdAt: minutesFromNow(-800),
  },

  // --- Wuse Commercial Plaza Property Rooms ---
  // 5. Shop 3, Ground Floor
  {
    id: 'msg-wcp-p5-1',
    channelId: 'prop-wcp-shop-3',
    senderId: 'tamuno',
    type: 'text',
    text: 'Retail space suitable for boutique pharmacy or specialty supermarket with high footfall.',
    createdAt: minutesFromNow(-1750),
  },
  {
    id: 'msg-wcp-p5-photo',
    channelId: 'prop-wcp-shop-3',
    senderId: 'isaac',
    type: 'file',
    fileName: 'shop-front.jpg',
    fileSize: '3.1 MB',
    fileKind: 'photo',
    text: 'shop-front.jpg',
    caption: 'Ground floor retail frontage and glass facade overlooking the main road.',
    createdAt: minutesFromNow(-1050),
  },
  {
    id: 'msg-wcp-p5-2',
    channelId: 'prop-wcp-shop-3',
    senderId: 'jatau',
    type: 'text',
    text: 'Client inquired about dedicated heavy equipment power loading capacity for refrigeration.',
    createdAt: minutesFromNow(-380),
  },

  // 6. Office Suite 12
  {
    id: 'msg-wcp-p6-1',
    channelId: 'prop-wcp-suite-12',
    senderId: 'tamuno',
    type: 'text',
    text: 'Suite 12 partitioned into three executive offices and central reception waiting area.',
    createdAt: minutesFromNow(-1650),
  },
  {
    id: 'msg-wcp-p6-2',
    channelId: 'prop-wcp-suite-12',
    senderId: 'isaac',
    type: 'text',
    text: 'Fibre optic conduit points have been inspected and confirmed working across the floor.',
    createdAt: minutesFromNow(-750),
  },

  // 7. Office Suite 14
  {
    id: 'msg-wcp-p7-1',
    channelId: 'prop-wcp-suite-14',
    senderId: 'tamuno',
    type: 'text',
    text: 'Corporate tenant submitted an offer for a multi-year commercial lease arrangement.',
    createdAt: minutesFromNow(-1550),
  },
  {
    id: 'msg-wcp-p7-2',
    channelId: 'prop-wcp-suite-14',
    senderId: 'jatau',
    type: 'text',
    text: 'Draft lease agreement sent for legal compliance review and tenancy vetting.',
    createdAt: minutesFromNow(-650),
  },

  // --- Riverside Gardens Property Rooms ---
  // 8. Plot 21
  {
    id: 'msg-rg-p8-1',
    channelId: 'prop-rg-plot-21',
    senderId: 'efosa',
    type: 'text',
    text: 'Plot ready for immediate residential construction with approved estate building guidelines.',
    createdAt: minutesFromNow(-1700),
  },
  {
    id: 'msg-rg-p8-doc',
    channelId: 'prop-rg-plot-21',
    senderId: 'uchechukwu',
    type: 'file',
    fileName: 'survey-plan.pdf',
    fileSize: '1.2 MB',
    fileKind: 'document',
    text: 'survey-plan.pdf',
    caption: 'Registered survey plan with coordinate beacons and boundary bearings.',
    createdAt: minutesFromNow(-980),
  },
  {
    id: 'msg-rg-p8-2',
    channelId: 'prop-rg-plot-21',
    senderId: 'godwin',
    type: 'text',
    text: 'Buyer inquired about topsoil firmness for foundation depth and drainage connection.',
    createdAt: minutesFromNow(-320),
  },

  // 9. Plot 22
  {
    id: 'msg-rg-p9-1',
    channelId: 'prop-rg-plot-22',
    senderId: 'efosa',
    type: 'text',
    text: 'Adjacent to Plot 21 with dual road access frontage and clear layout orientation.',
    createdAt: minutesFromNow(-1600),
  },
  {
    id: 'msg-rg-p9-2',
    channelId: 'prop-rg-plot-22',
    senderId: 'uchechukwu',
    type: 'text',
    text: 'Survey beacons checked this morning. Flags are firmly in position.',
    createdAt: minutesFromNow(-820),
  },

  // 10. Plot 30
  {
    id: 'msg-rg-p10-1',
    channelId: 'prop-rg-plot-30',
    senderId: 'efosa',
    type: 'text',
    text: 'Corner-piece plot under offer. Awaiting initial documentation deposit confirmation.',
    createdAt: minutesFromNow(-1450),
  },
  {
    id: 'msg-rg-p10-2',
    channelId: 'prop-rg-plot-30',
    senderId: 'george',
    type: 'text',
    text: 'Boundary pegs marked with high-visibility boundary tape for inspection clarity.',
    createdAt: minutesFromNow(-550),
  },

  // 11. 4-Bed Terrace 5
  {
    id: 'msg-rg-p11-1',
    channelId: 'prop-rg-terrace-5',
    senderId: 'efosa',
    type: 'text',
    text: 'Terrace unit roofing completed. Interior conduit and wall plastering currently ongoing.',
    createdAt: minutesFromNow(-1850),
  },
  {
    id: 'msg-rg-p11-photo',
    channelId: 'prop-rg-terrace-5',
    senderId: 'uchechukwu',
    type: 'file',
    fileName: 'terrace-exterior.jpg',
    fileSize: '3.4 MB',
    fileKind: 'photo',
    text: 'terrace-exterior.jpg',
    caption: 'Terrace facade and private car park apron showing completed roofing.',
    createdAt: minutesFromNow(-1150),
  },
  {
    id: 'msg-rg-p11-2',
    channelId: 'prop-rg-terrace-5',
    senderId: 'godwin',
    type: 'text',
    text: 'Client booked viewing inspection for Thursday afternoon at 3:00 PM.',
    createdAt: minutesFromNow(-420),
  },

  // --- Waterfront Close Property Rooms ---
  // 12. Detached Duplex 1
  {
    id: 'msg-wfc-p12-1',
    channelId: 'prop-wfc-duplex-1',
    senderId: 'micheal',
    type: 'text',
    text: 'Five-bedroom detached duplex with private swimming pool and attached boys quarters.',
    createdAt: minutesFromNow(-1950),
  },
  {
    id: 'msg-wfc-p12-photo',
    channelId: 'prop-wfc-duplex-1',
    senderId: 'ngozi',
    type: 'file',
    fileName: 'duplex-front.jpg',
    fileSize: '3.7 MB',
    fileKind: 'photo',
    text: 'duplex-front.jpg',
    caption: 'Front elevation and landscaped entrance driveway of the detached duplex.',
    createdAt: minutesFromNow(-1250),
  },
  {
    id: 'msg-wfc-p12-2',
    channelId: 'prop-wfc-duplex-1',
    senderId: 'christy',
    type: 'text',
    text: 'Client requested confirmation of the water filtration capacity and generator pad sizing.',
    createdAt: minutesFromNow(-480),
  },

  // 13. Detached Duplex 2
  {
    id: 'msg-wfc-p13-1',
    channelId: 'prop-wfc-duplex-2',
    senderId: 'micheal',
    type: 'text',
    text: 'Transaction successfully completed and ownership title transferred to client.',
    createdAt: minutesFromNow(-1750),
  },
  {
    id: 'msg-wfc-p13-doc',
    channelId: 'prop-wfc-duplex-2',
    senderId: 'ngozi',
    type: 'file',
    fileName: 'title-deed-extract.pdf',
    fileSize: '1.6 MB',
    fileKind: 'document',
    text: 'title-deed-extract.pdf',
    caption: 'Deed of assignment and title verification extract archived in compliance records.',
    createdAt: minutesFromNow(-1050),
  },
  {
    id: 'msg-wfc-p13-2',
    channelId: 'prop-wfc-duplex-2',
    senderId: 'ndidiamaka',
    type: 'text',
    text: 'All keys and equipment warranty binders delivered to the client representative.',
    createdAt: minutesFromNow(-390),
  },

  // 14. Terrace 6
  {
    id: 'msg-wfc-p14-1',
    channelId: 'prop-wfc-terrace-6',
    senderId: 'micheal',
    type: 'text',
    text: 'Offer accepted on Terrace 6. Tenancy and mortgage vetting documentation in progress.',
    createdAt: minutesFromNow(-1400),
  },
  {
    id: 'msg-wfc-p14-2',
    channelId: 'prop-wfc-terrace-6',
    senderId: 'ngozi',
    type: 'text',
    text: 'Mortgage pre-qualification approval received from client banking partner.',
    createdAt: minutesFromNow(-620),
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



