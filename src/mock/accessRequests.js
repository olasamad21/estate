import { minutesFromNow } from '../utils/formatters.js';

export const SEED_ACCESS_REQUESTS = [
  {
    id: 'blessing-nwachukwu',
    name: 'Blessing Nwachukwu',
    phone: '+2348030000112',
    officeId: 'abuja',
    requestedRole: 'agent',
    status: 'pending',
    createdAt: minutesFromNow(-180),
    decidedAt: null,
  },
  {
    id: 'yusuf-danjuma',
    name: 'Yusuf Danjuma',
    phone: '+2348030000113',
    officeId: 'lagos',
    requestedRole: 'intern',
    status: 'pending',
    createdAt: minutesFromNow(-1440),
    decidedAt: null,
  },
];
