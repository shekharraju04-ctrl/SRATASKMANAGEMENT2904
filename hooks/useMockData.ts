import type { TaskTemplate } from '../types';

// The following data will now be fetched from Supabase, so these arrays are no longer needed here.
// They are kept to prevent breaking imports in components that are not yet refactored.
export const assignees = [];
export const clients = [];
export const projects = [];


export const mockTaskTemplates: TaskTemplate[] = [
  {
    id: 'template-1',
    name: 'New Client Onboarding',
    title: 'Onboard New Client: [Client Name]',
    description: 'Complete the new client onboarding workflow, including KYC checks, engagement letter signing, and setting up their file in our system.',
    engagementType: 'Advisory',
    subtasks: [
      'Perform KYC & AML checks',
      'Send engagement letter for signature',
      'Set up client file in practice management software',
      'Schedule initial kick-off call',
    ],
  },
  {
    id: 'template-2',
    name: 'Monthly Payroll Process',
    title: 'Process Monthly Payroll for [Client Name]',
    description: 'Process monthly payroll, including commissions and overtime calculations.',
    engagementType: 'Bookkeeping',
    subtasks: [
      'Receive payroll data from client',
      'Calculate gross wages, commissions, and overtime',
      'Process deductions (tax, NI, pension)',
      'Generate payslips for distribution',
      'Submit RTI report to HMRC',
      'Prepare payment file for bank transfer',
      'Senior review of payroll register',
    ],
  },
  {
    id: 'template-3',
    name: 'Quarterly VAT Return',
    title: 'Prepare Q[X] VAT Return for [Client Name]',
    description: 'Prepare and submit the quarterly VAT return. Reconcile sales and purchase ledgers with VAT records.',
    engagementType: 'Tax',
    subtasks: [
        'Gather all sales invoices for the quarter',
        'Collect all purchase receipts for the quarter',
        'Reconcile bank statements with accounting records',
        'Perform VAT calculation',
        'Client review and approval',
        'Submit VAT return via MTD software',
    ]
  }
];

// The useMockData hook is no longer used as data is fetched live from the database.
// It is removed to avoid confusion.
export default function useMockData() {
  return { tasks: [], setTasks: () => {} };
}