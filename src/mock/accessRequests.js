import { minutesFromNow } from '../utils/formatters.js';

export const SEED_ACCESS_REQUESTS = [
  {
    id: 'blessing-nwachukwu',
    name: 'Blessing Nwachukwu',
    phone: '+2340000000101',
    officeId: 'lugbe',
    requestedRole: 'agent',
    status: 'pending',
    createdAt: minutesFromNow(-180),
    decidedAt: null,
  },
  {
    id: 'yusuf-danjuma',
    name: 'Yusuf Danjuma',
    phone: '+2340000000102',
    officeId: 'port-harcourt',
    requestedRole: 'intern',
    status: 'pending',
    createdAt: minutesFromNow(-1440),
    decidedAt: null,
  },
];
