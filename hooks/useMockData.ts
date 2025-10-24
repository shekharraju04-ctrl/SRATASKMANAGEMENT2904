import { useState } from 'react';
import type { Task, Assignee, Client, Project, TaskTemplate } from '../types';
import { Status, Priority } from '../types';

export const assignees: Assignee[] = [
  { name: 'Sarah Chen', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'David Lee', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { name: 'Maria Garcia', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

export const clients: Client[] = [
    { id: 'client-1', name: 'Innovate Corp' },
    { id: 'client-2', name: 'Tech Solutions Ltd' },
    { id: 'client-3', name: 'GreenScape LLC' },
    { id: 'client-4', name: 'Global Exports Inc.' },
];

export const projects: Project[] = [
    { id: 'proj-1', name: 'Innovate Corp - 2025 Tax Compliance', clientId: 'client-1'},
    { id: 'proj-2', name: 'Tech Solutions Ltd - FY2025 Audit', clientId: 'client-2'},
    { id: 'proj-3', name: 'General Advisory & Onboarding', clientId: 'client-3'},
    { id: 'proj-4', name: 'Global Exports - Ongoing Bookkeeping', clientId: 'client-4'},
    { id: 'proj-5', name: 'Innovate Corp - Management Accounts', clientId: 'client-1'},
];

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


const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Q3 VAT Filing for Innovate Corp',
    description: 'Prepare and submit the quarterly VAT return. Reconcile sales and purchase ledgers with VAT records. Ensure compliance with latest HMRC digital tax rules.',
    priority: Priority.Urgent,
    status: Status.ToDo,
    startDate: '2025-09-20',
    dueDate: '2025-10-07',
    assignee: assignees[0],
    subtasks: [
      { id: 'sub-1-1', text: 'Gather all sales invoices for Q3', completed: true },
      { id: 'sub-1-2', text: 'Collect all purchase receipts for Q3', completed: false },
    ],
    clientId: 'client-1',
    projectId: 'proj-1',
    engagementType: 'Tax',
    financials: {
      totalFee: 1500,
      amountReceived: 750,
      receivedBy: 'Admin',
      receivedDate: '2025-09-15',
    },
    comments: [],
    attachments: [],
  },
  {
    id: 'task-2',
    title: 'Annual Audit for Tech Solutions Ltd',
    description: 'Conduct the year-end statutory audit. Includes planning, fieldwork, and drafting the final audit report.',
    priority: Priority.High,
    status: Status.InProgress,
    startDate: '2025-09-01',
    dueDate: '2025-10-15',
    assignee: assignees[1],
    subtasks: [
      { id: 'sub-2-1', text: 'Send initial document request list', completed: true },
      { id: 'sub-2-2', text: 'Perform preliminary analytical review', completed: true },
      { id: 'sub-2-3', text: 'Test accounts receivable controls', completed: false },
    ],
    clientId: 'client-2',
    projectId: 'proj-2',
    engagementType: 'Audit',
    financials: {
        totalFee: 8000,
    },
    comments: [
        { id: 'comment-1', user: assignees[3], text: 'Can you double-check the sales cutoff testing figures?', createdAt: '2025-09-18T10:30:00Z' }
    ],
    attachments: [
        { id: 'attach-1', name: 'Preliminary_TB.xlsx', url: '#', size: '1.2MB', type: 'spreadsheet' }
    ]
  },
  {
    id: 'task-3',
    title: 'Onboard new client: GreenScape LLC',
    description: 'Complete the new client onboarding workflow, including KYC checks, engagement letter signing, and setting up their file in our system.',
    priority: Priority.Medium,
    status: Status.ToDo,
    startDate: '2025-10-01',
    dueDate: '2025-10-10',
    assignee: assignees[2],
    subtasks: [],
    clientId: 'client-3',
    projectId: 'proj-3',
    engagementType: 'Advisory',
    comments: [],
    attachments: [],
  },
  {
    id: 'task-4',
    title: 'September Payroll for Global Exports Inc.',
    description: 'Process monthly payroll for 50 employees, including commissions and overtime calculations.',
    priority: Priority.High,
    status: Status.InReview,
    startDate: '2025-09-25',
    dueDate: '2025-09-28',
    assignee: assignees[3],
    subtasks: [
        { id: 'sub-4-1', text: 'Calculate gross wages', completed: true },
        { id: 'sub-4-2', text: 'Process deductions', completed: true },
        { id: 'sub-4-3', text: 'Generate payslips', completed: true },
        { id: 'sub-4-4', text: 'Senior review of payroll register', completed: false },
    ],
    clientId: 'client-4',
    projectId: 'proj-4',
    engagementType: 'Bookkeeping',
    financials: {
        totalFee: 500,
        amountReceived: 500,
        receivedBy: 'Stripe',
        receivedDate: '2025-09-01',
    },
    comments: [],
    attachments: [],
  },
  {
    id: 'task-5',
    title: 'Management Accounts for Innovate Corp',
    description: 'Prepare the monthly management accounts pack including P&L, Balance Sheet, and Cash Flow statement.',
    priority: Priority.Medium,
    status: Status.InProgress,
    startDate: '2025-10-05',
    dueDate: '2025-10-12',
    assignee: assignees[0],
    subtasks: [
        { id: 'sub-5-1', text: 'Finalize bank reconciliations', completed: true },
        { id: 'sub-5-2', text: 'Post accruals and prepayments', completed: false },
    ],
    clientId: 'client-1',
    projectId: 'proj-5',
    engagementType: 'Bookkeeping',
    comments: [],
    attachments: [],
  },
  {
    id: 'task-6',
    title: 'Finalize Audit Report for Tech Solutions Ltd',
    description: 'Draft and finalize the audit findings report and management letter based on the completed fieldwork.',
    priority: Priority.High,
    status: Status.InReview,
    startDate: '2025-09-28',
    dueDate: '2025-10-05',
    assignee: assignees[1],
    subtasks: [
        { id: 'sub-6-1', text: 'Draft management letter points', completed: true },
        { id: 'sub-6-2', text: 'Review draft with Audit Partner', completed: true },
        { id: 'sub-6-3', text: 'Send final report to client', completed: false },
    ],
    clientId: 'client-2',
    projectId: 'proj-2',
    engagementType: 'Audit',
    dependsOn: 'task-2',
    comments: [],
    attachments: [],
  },
  {
    id: 'task-7',
    title: 'Await client signature on engagement letter',
    description: 'The engagement letter for the new advisory project has been sent. Awaiting client signature before work can commence.',
    priority: Priority.Medium,
    status: Status.PendingClient,
    startDate: '2025-10-11',
    dueDate: '2025-10-20',
    assignee: assignees[2],
    subtasks: [],
    clientId: 'client-3',
    projectId: 'proj-3',
    engagementType: 'Advisory',
    dependsOn: 'task-3',
    comments: [],
    attachments: [],
  },
  {
    id: 'task-8',
    title: 'Reconcile Q2 Bank Statements',
    description: 'Bank statements for Q2 are still outstanding. This task is now overdue.',
    priority: Priority.High,
    status: Status.ToDo,
    startDate: '2025-08-28',
    dueDate: '2025-09-01', // Overdue date relative to other tasks
    assignee: assignees[0],
    subtasks: [
      { id: 'sub-8-1', text: 'Download statements from banking portal', completed: false },
      { id: 'sub-8-2', text: 'Match transactions in accounting software', completed: false },
    ],
    clientId: 'client-1',
    projectId: 'proj-5',
    engagementType: 'Bookkeeping',
    comments: [],
    attachments: [],
  },
];


export default function useMockData() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
  return { tasks, setTasks };
}
