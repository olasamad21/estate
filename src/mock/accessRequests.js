import { minutesFromNow } from '../utils/formatters.js';

export const SEED_ACCESS_REQUESTS = [
  {
    id: 'blessing-nwachukwu',
    name: 'Blessing Nwachukwu',
    email: 'blessing.nwachukwu@example.com',
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
    email: 'yusuf.danjuma@example.com',
    phone: '+2340000000102',
    officeId: 'port-harcourt',
    requestedRole: 'intern',
    status: 'approved',
    createdAt: minutesFromNow(-1440),
    decidedAt: minutesFromNow(-720),
  },
];

export const SEED_ACTIVATION_LINKS = [
  {
    token: 'yusuf-activation-token',
    staffId: 'yusuf-danjuma',
    createdAt: minutesFromNow(-720),
    expiresAt: minutesFromNow(48 * 60 - 720),
    usedAt: null,
    wrongConfirmations: 0,
  },
  {
    token: 'expired-demo',
    staffId: 'yusuf-danjuma',
    createdAt: minutesFromNow(-3000),
    expiresAt: minutesFromNow(-120),
    usedAt: null,
    wrongConfirmations: 0,
  },
];
