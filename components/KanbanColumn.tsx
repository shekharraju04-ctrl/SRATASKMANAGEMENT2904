import React from 'react';
import type { Column, Task, TaskWithDetails, SortBy } from '../types';
import { TaskCard } from './TaskCard';
import { Status } from '../types';

interface KanbanColumnProps {
  column: Column;
  onOpenAIAssistant: (task: TaskWithDetails) => void;
  onOpenEditModal: (task: TaskWithDetails) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  allTasks: Task[];
}

const statusColors: Record<Status, string> = {
  [Status.ToDo]: 'border-blue-500',
  [Status.InProgress]: 'border-yellow-500',
  [Status.InReview]: 'border-purple-500',
  [Status.PendingClient]: 'border-orange-500',
  [Status.Done]: 'border-green-500',
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onOpenAIAssistant, onOpenEditModal, onToggleSubtask, sortBy, setSortBy, allTasks }) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full border-t-4 ${statusColors[column.id]}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{column.title}</h2>
            <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 text-sm font-bold px-2 py-1 rounded-full">
            {column.tasks.length}
            </span>
        </div>
        <div>
            <label htmlFor={`sort-${column.id}`} className="sr-only">Sort tasks</label>
            <select
                id={`sort-${column.id}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="block w-full pl-3 pr-8 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
                <option value="default">Default</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="assignee">Assignee</option>
            </select>
        </div>
      </div>
      <div className="space-y-4">
        {column.tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onOpenAIAssistant={onOpenAIAssistant}
            onOpenEditModal={onOpenEditModal}
            onToggleSubtask={onToggleSubtask}
            allTasks={allTasks}
          />
        ))}
      </div>
    </div>
  );
};