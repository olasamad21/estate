/**
 * Market & Localization Configuration
 * Single source of truth for currency, locale, formatting rules, and neutral sample entities.
 */

export const MARKET_CONFIG = {
  currency: 'USD',
  currencySymbol: '$',
  locale: 'en-US',
  marketName: 'Bay Coastal Metro',

  // Neutral, plausible real estate sample addresses
  sampleAddresses: [
    {
      id: 'addr_harbor_218',
      address: '218 Harbor View Lane',
      city: 'Marina Bay',
      state: 'CA',
      zip: '94901',
      unit: '',
    },
    {
      id: 'addr_crestwood_740',
      address: '740 Crestwood Drive',
      city: 'Oakridge',
      state: 'CA',
      zip: '94611',
      unit: '',
    },
    {
      id: 'addr_meadowbrook_104',
      address: '104 Meadowbrook Court',
      city: 'San Mateo',
      state: 'CA',
      zip: '94402',
      unit: 'Unit 3B',
    },
    {
      id: 'addr_aspen_512',
      address: '512 Aspen Ridge Way',
      city: 'Walnut Creek',
      state: 'CA',
      zip: '94596',
      unit: '',
    },
    {
      id: 'addr_stclaire_890',
      address: '890 St. Claire Avenue',
      city: 'Berkeley',
      state: 'CA',
      zip: '94705',
      unit: '',
    },
  ],

  // Plausible neutral company names (no trademarked / real banks or brokerages)
  sampleCompanies: {
    brokerage: 'Northgate Realty Group',
    lender: 'Summit Federal Credit',
    escrow: 'Harborpoint Escrow Services',
    inspection: 'Apex Home Inspection Partners',
    title: 'Pacific Horizon Title Co.',
  },
};

export default MARKET_CONFIG;
