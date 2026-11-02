/**
 * Mock leads pools keyed by office id (hq, lugbe, port-harcourt).
 * Exactly 5 invented clients per office.
 * Zero date literals, zero emoji.
 */

export const LEADS_BY_OFFICE = {
  hq: [
    {
      clientName: 'Senator Aliyu Garba',
      enquiry: 'Prime 6-bedroom ambassadorial mansion with guest chalet and pool in Maitama.',
      area: 'Maitama',
      budgetNgn: 1200000000,
    },
    {
      clientName: 'Hajiya Maryam Bello',
      enquiry: 'Spacious 5-bedroom fully detached duplex with BQ in diplomatic zone.',
      area: 'Maitama',
      budgetNgn: 550000000,
    },
    {
      clientName: 'Dr. Kabir Usman',
      enquiry: 'Modern 4-bedroom terrace duplex in a serviced residential court.',
      area: 'Wuse 2',
      budgetNgn: 280000000,
    },
    {
      clientName: 'Barrister Nnamdi Okereke',
      enquiry: 'Commercial property suitable for corporate chambers or consultancy office.',
      area: 'Wuse 2',
      budgetNgn: 420000000,
    },
    {
      clientName: 'Engr. Mustapha Balarabe',
      enquiry: 'Well-finished 4-bedroom townhouse with perimeter security.',
      area: 'Garki',
      budgetNgn: 185000000,
    },
  ],
  lugbe: [
    {
      clientName: 'Alhaji Sanusi Lamido',
      enquiry: '3-bedroom semi-detached bungalow in a gated community along Airport Road.',
      area: 'Airport Road',
      budgetNgn: 75000000,
    },
    {
      clientName: 'Mrs. Ngozi Eze',
      enquiry: '4-bedroom terrace duplex with stable borehole and power supply in Lugbe.',
      area: 'Lugbe',
      budgetNgn: 65000000,
    },
    {
      clientName: 'Pastor Emmanuel Adeleke',
      enquiry: '2 plots of dry commercial land suitable for institutional development.',
      area: 'Kuje',
      budgetNgn: 90000000,
    },
    {
      clientName: 'Dr. Ifeanyi Chukwuma',
      enquiry: 'Newly completed 3-bedroom apartment with dedicated parking space.',
      area: 'Lugbe',
      budgetNgn: 48000000,
    },
    {
      clientName: 'Hajia Fatima Ibrahim',
      enquiry: 'Prime commercial land facing the expressway for warehousing.',
      area: 'Airport Road',
      budgetNgn: 120000000,
    },
  ],
  'port-harcourt': [
    {
      clientName: 'Chief Diepriye Briggs',
      enquiry: 'Executive 5-bedroom detached mansion with penthouse and swimming pool.',
      area: 'GRA Phase 2',
      budgetNgn: 650000000,
    },
    {
      clientName: 'Engr. Tari West',
      enquiry: 'Industrial warehouse and logistics yard with trailer access.',
      area: 'Trans-Amadi',
      budgetNgn: 450000000,
    },
    {
      clientName: 'Dr. (Mrs.) Blessing Amadi',
      enquiry: '4-bedroom serviced duplex within an executive residential enclave.',
      area: 'GRA Phase 2',
      budgetNgn: 240000000,
    },
    {
      clientName: 'Elder Soboma George',
      enquiry: 'Commercial multi-storey office complex along main transit route.',
      area: 'Rumuola',
      budgetNgn: 320000000,
    },
    {
      clientName: 'Mrs. Ibiere Peterside',
      enquiry: 'Modern 3-bedroom flat for oil & gas corporate tenancy.',
      area: 'Rumuola',
      budgetNgn: 85000000,
    },
  ],
};

export const HQ_LEADS_POOL = LEADS_BY_OFFICE.hq;
export const LUGBE_LEADS_POOL = LEADS_BY_OFFICE.lugbe;
export const PORT_HARCOURT_LEADS_POOL = LEADS_BY_OFFICE['port-harcourt'];

