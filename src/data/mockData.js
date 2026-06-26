import {
  CloudUpload,
} from 'lucide-react'

export const navigation = [
  { id: 'extraction', label: 'Lease Extraction', path: '/lease-extraction', icon: CloudUpload },
]

export const leases = [
  {
    id: 'lease-arc-apc',
    name: 'Arc APC Clinic',
    location: 'Atlanta, GA',
    status: 'Draft Ready',
    review: 'Needs account approval',
    monthlyPayment: 17589,
    liability: 497290,
    owner: 'James Stovall',
    uploaded: 'Jun 24, 2026',
  },
  {
    id: 'lease-north-dental',
    name: 'Northside Dental',
    location: 'Charlotte, NC',
    status: 'Approved',
    review: 'Validated',
    monthlyPayment: 12840,
    liability: 318420,
    owner: 'Finance Ops',
    uploaded: 'Jun 23, 2026',
  },
  {
    id: 'lease-river-care',
    name: 'River Care Clinic',
    location: 'Tampa, FL',
    status: 'Manual Review',
    review: 'Multiple locations in workbook',
    monthlyPayment: 21320,
    liability: 612880,
    owner: 'Lease Team',
    uploaded: 'Jun 22, 2026',
  },
]

export const paymentSchedule = [
  {
    startMonth: 1,
    endMonth: 12,
    payment: 17589,
    rule: 'Fixed base rent',
    frequency: 12,
    notes: 'First year payment schedule from lease contract',
    source: 'Monthly base rent clause',
  },
  {
    startMonth: 13,
    endMonth: 36,
    payment: 18117,
    rule: 'Annual escalation',
    frequency: 12,
    notes: '3 percent annual adjustment',
    source: 'Rent adjustment section',
  },
  {
    startMonth: 37,
    endMonth: 60,
    payment: 18660,
    rule: 'Annual escalation',
    frequency: 12,
    notes: 'Remaining term uses indexed increase',
    source: 'Renewal and rent table',
  },
]

export const journalEntries = [
  {
    account: '6400 - Lease Expense',
    description: 'Monthly lease amortization expense',
    debit: 16696,
    credit: 0,
  },
  {
    account: '1705 - ROU Asset',
    description: 'ROU asset amortization adjustment',
    debit: 0,
    credit: 497,
  },
  {
    account: '2310 - ST Lease Liability',
    description: 'Short-term lease liability reclass',
    debit: 0,
    credit: 194,
  },
  {
    account: '2320 - LT Lease Liability',
    description: 'Long-term lease liability movement',
    debit: 0,
    credit: 16005,
  },
]

export const historyRows = [
  {
    property: 'Arc APC Clinic',
    month: 'May 2026',
    status: 'Generated',
    amount: 16696,
    date: 'Jun 24, 2026',
  },
  {
    property: 'Northside Dental',
    month: 'May 2026',
    status: 'Uploaded',
    amount: 11920,
    date: 'Jun 23, 2026',
  },
  {
    property: 'River Care Clinic',
    month: 'May 2026',
    status: 'Review',
    amount: 20540,
    date: 'Jun 22, 2026',
  },
  {
    property: 'West End Ortho',
    month: 'April 2026',
    status: 'Generated',
    amount: 14370,
    date: 'May 30, 2026',
  },
]
