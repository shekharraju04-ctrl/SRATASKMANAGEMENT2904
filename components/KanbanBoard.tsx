import React from 'react';
import type { Column, Task, Status, TaskWithDetails, SortBy } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  columns: Map<Status, Column>;
  onOpenAIAssistant: (task: TaskWithDetails) => void;
  onOpenEditModal: (task: TaskWithDetails) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  allTasks: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onOpenAIAssistant, onOpenEditModal, onToggleSubtask, sortBy, setSortBy, allTasks }) => {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* FIX: Explicitly typed `column` as `Column` to resolve a type inference error. */}
      {Array.from(columns.values()).map((column: Column) => (
        <KanbanColumn 
          key={column.id} 
          column={column} 
          onOpenAIAssistant={onOpenAIAssistant}
          onOpenEditModal={onOpenEditModal}
          onToggleSubtask={onToggleSubtask}
          sortBy={sortBy}
          setSortBy={setSortBy}
          allTasks={allTasks}
        />
      ))}
    </div>
  );
};