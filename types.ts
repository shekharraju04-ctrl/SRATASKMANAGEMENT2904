export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  PendingClient = 'Pending Client',
  Done = 'Done',
}

export interface Assignee {
  name: string;
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
    id: string;
    user: {
        name: string;
        avatarUrl: string;
    };
    text: string;
    createdAt: string;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    size: string;
    type: string;
}

export interface Financials {
  totalFee: number;
  amountReceived?: number;
  receivedBy?: string;
  receivedDate?: string;
  balanceReceivedDate?: string;
  balanceReceivedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
  assignee: Assignee;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  clientId: string;
  projectId: string;
  engagementType: 'Audit' | 'Tax' | 'Advisory' | 'Bookkeeping';
  dependsOn?: string;
  financials?: Financials;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  engagementType: Task['engagementType'];
  subtasks: string[];
}

export type NewTaskData = Omit<Task, 'id' | 'status' | 'subtasks' | 'financials' | 'comments' | 'attachments'> & {
    totalFee?: number;
    subtaskStrings?: string[];
    attachments?: Omit<Attachment, 'id'>[];
};

export interface TaskWithDetails extends Task {
    clientName: string;
    projectName: string;
}

export type SortBy = 'default' | 'priority' | 'dueDate' | 'assignee';

export interface Column {
  id: Status;
  title: string;
  tasks: TaskWithDetails[];
}

export interface User {
  email: string;
}
